#!/usr/bin/env -S zsh

# Note, this script has a bug where it does not handle italic fonts correctly

font_display="swap"
url="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Roboto:wght@400;700&display=$font_display"
result=$(curl -sH "user-agent: Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0" "$url")
extract_url () {
	grep -Eo "https://[^)]+" <<< "$1"
}
urls=$(extract_url "$result")

types=""
while read line; do
	start_trimmed="${line#/\* *}"
	types="$types${start_trimmed%* \*/}\n"
done <<< "$(grep "^/\*" <<< "$result")"

weights=""
while read line; do
	start_trimmed="${line#font-weight: *}"
	weights="$weights${start_trimmed%*;}\n"
done <<< "$(grep 'font-weight' <<< "$result")"

names=""
while read line; do
	start_trimmed="${line#font-family: \'*}"
	end_trimmed="${start_trimmed%*\';}"
	names="$names${end_trimmed// /_}\n"
done <<< "$(grep 'font-family' <<< "$result")"

base_dir="src/static/fonts"

if [ ! -d "$base_dir" ]; then
  mkdir "$base_dir"
fi

out_dir="$base_dir/google-fonts"
if [ -d "$out_dir" ]; then
	rm -r "$out_dir"
	mkdir "$out_dir"
else
  mkdir "$out_dir"
fi

filenames=""
count=1
while read line; do
	name="$(echo "$names" | awk "NR==$count")"
	weight="$(echo "$weights" | awk "NR==$count")"
	type="$(echo "$types" | awk "NR==$count")"

	filename="${name}_${weight}_${type}.$(echo "$line" | grep -Eo '[^.]+$')"

	wget -q "$line" --output-document="$out_dir/$filename"

	filenames="$filenames$filename\n"

	(( count++ ))
done <<< "$urls"

stylesheet_file="src/static/fonts/google-fonts.css"
if [ -f "$stylesheet_file" ]; then
	rm "$stylesheet_file"
fi

count=1
while IFS=$'\n' read line; do
	if [[ $line == *"https"* ]]; then
	 	filename="$(echo "$filenames" | awk "NR==$count")"
	 	printf "${line%url*}" >> "$stylesheet_file"
	 	printf "url(/fonts/google-fonts/$filename)" >> "$stylesheet_file"
	 	echo "${line#*)}" >> "$stylesheet_file"
		(( count++ ))
	else 
		echo "$line" >> "$stylesheet_file"
	fi
done <<< "$result"
