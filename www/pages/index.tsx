import React from 'react'
import { css } from '$pangea/src/css.ts'
import { Head } from '$pangea/src/head.ts'

import { Island } from '$pangea/src/island.ts'
import Counter from '../islands/Counter.tsx'

import ResponsivePicture from '../components/ResponsivePicture.tsx'

const Page = ({ title, description }: { title: string, description: string }) => {
  return (
    <>
      <Head>
        <link href='/fonts/google-fonts.css' rel='stylesheet' />
        <link rel='stylesheet' href='/css/modern-normalize.css' />
        <link rel='stylesheet' href='/css/custom-resets.css' />
        <meta name='description' content={description} />
        <title>{title}</title>
      </Head>
      <div
        className={css`
          position: relative;
          width: 100%;
          height: 50vh;
          background-color: #28534d;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          padding: 1.5rem;
        `}
      >
        <ResponsivePicture
          className={css`
            position: absolute;
            width: 100%;
            height: 100%;
            > img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              opacity: 0.75;
              mix-blend-mode: luminosity;
              filter: brightness(50%);
            }
          `}
          src='/images/optimized/cover_w$1.$2'
        />
        <h1
          className={css`
            font-family: 'Fredoka One', cursive;
            font-size: 4rem;
            color: #fff;
            position: relative;
            letter-spacing: 0.045em;
          `}
        >
          Pangea
        </h1>
        <p
          className={css`
            color: #fff;
            position: relative;
            margin-top: 1rem;
            font-size: 1.5rem;
            font-family: 'Roboto', sans-serif;
            text-align: center;
          `}
        >
          A static site generator built with performance in mind.
        </p>
        <div
          className={css`
            margin-top: 2rem;
            position: relative;
          `}
        >
          <a
            href='https://github.com/keastudio/pangea'
            className={css`
              color: #fff;

              &:focus,
              &:hover {
                color: #76ffec;
              }

              display: inline-flex;
            `}
          >
            <svg width={48} height={48} viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><title>GitHub</title><path fill='currentColor' d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' /></svg>
          </a>
          <a
            href='https://deno.land/x/pangea'
            className={css`
              color: #fff;

              &:focus,
              &:hover {
                color: #76ffec;
              }

              margin-left: 1.5rem;

              display: inline-flex;
            `}
          >
            <svg width={48} height={48} viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><title>Deno</title><path fill='currentColor' d='M12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0Zm-.469 6.793c-3.49 0-6.204 2.196-6.204 4.928 0 2.58 2.498 4.228 6.37 4.145l.118-.003.425-.012-.109.279.013.029c.031.072.06.145.084.22l.01.028.015.045.021.065.014.045.014.047.015.049.021.075.022.079.015.054.023.084.022.088.023.091.023.095.015.065.024.1.023.103.032.143.017.074.024.114.024.117.025.12.035.174.029.142.037.195.02.1.028.155.03.158.039.217.04.225.04.231.041.24.042.246.042.254.042.26.032.201.055.344.022.14.055.36.045.295.034.227.046.308.023.156a10.758 10.758 0 0 0 6.529-3.412l.05-.055-.238-.891-.633-2.37-.395-1.47-.348-1.296-.213-.787-.136-.498-.081-.297-.073-.264-.032-.11-.018-.064-.01-.034-.008-.026a6.042 6.042 0 0 0-2.038-2.97c-1.134-.887-2.573-1.351-4.252-1.351ZM8.467 19.3a.586.586 0 0 0-.714.4l-.004.013-.527 1.953c.328.163.665.309 1.008.437l.08.03.57-2.114.004-.015a.586.586 0 0 0-.417-.704Zm3.264-1.43a.586.586 0 0 0-.715.4l-.004.014-.796 2.953-.004.014a.586.586 0 0 0 1.131.305l.004-.014.797-2.953.003-.014a.585.585 0 0 0 .013-.067l.002-.022-.019-.096-.027-.138-.018-.086a.584.584 0 0 0-.367-.295Zm-5.553-3.04a.59.59 0 0 0-.037.09l-.005.02-.797 2.953-.004.014a.586.586 0 0 0 1.131.306l.004-.014.723-2.678a5.295 5.295 0 0 1-1.015-.692Zm-1.9-3.397a.586.586 0 0 0-.715.4l-.004.013-.797 2.953-.003.015a.586.586 0 0 0 1.13.305l.005-.014.797-2.953.003-.015a.586.586 0 0 0-.416-.704Zm17.868-.67a.586.586 0 0 0-.715.399l-.004.014-.797 2.953-.003.014a.586.586 0 0 0 1.13.305l.005-.014.797-2.953.003-.014a.586.586 0 0 0-.416-.704ZM2.542 6.82a10.707 10.707 0 0 0-1.251 3.926.586.586 0 0 0 1.002-.22l.004-.014.797-2.953.003-.014a.586.586 0 0 0-.555-.725Zm17.585.02a.586.586 0 0 0-.714.4l-.004.014-.797 2.953-.004.014a.586.586 0 0 0 1.131.305l.004-.014.797-2.953.004-.014a.586.586 0 0 0-.417-.704Zm-7.846 1.926a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm-6.27-4.733a.586.586 0 0 0-.715.398l-.004.015-.797 2.953-.004.014a.586.586 0 0 0 1.132.305l.003-.014.797-2.953.004-.014a.586.586 0 0 0-.417-.704Zm10.238.558a.586.586 0 0 0-.714.399l-.004.014-.536 1.984c.347.171.678.373.99.603l.051.038.626-2.32.004-.014a.586.586 0 0 0-.417-.704Zm-5.211-3.33c-.374.033-.746.086-1.115.158l-.078.015-.742 2.753-.004.015a.586.586 0 0 0 1.131.305l.004-.014.797-2.953.004-.015a.583.583 0 0 0 .003-.264Zm7.332 2.04-.156.58-.004.015a.586.586 0 0 0 1.131.305l.004-.014.017-.063a10.838 10.838 0 0 0-.923-.772l-.069-.051Zm-4.636-1.944-.283 1.048-.003.014a.586.586 0 0 0 1.13.305l.005-.014.297-1.102c-.35-.097-.705-.176-1.063-.237l-.083-.014Z' /></svg>
          </a>
        </div>

        
      </div>
      <div
        className={css`
          padding: 4rem 1.5rem;
          @media (min-width: 768px) {
            padding: 8rem 8rem;
          }
          @media (min-width: 1200px) {
            padding: 8rem 12rem;
          }
        `}
      >
        <h2 
          className={css`
            max-width: 40rem;
            font-family: 'Roboto', sans-serif;
            font-weight: 700;
            font-size: 3rem;
            color: #444;
          `}
        >
          Features
        </h2>
        <ul
          className={css`
            margin-top: 1.5rem;
          `}
        >
          {[
            'Exports static files, which can be deployed to Netlify and Vercel',
            'No JavaScript is shipped to the frontend by default',
            'Island architecture—only interactive React components are hydrated on the client side',
            'Built in support for CSS-in-JS, which is statically generated for performance',
            'Next.js inspired file-system routing'
          ]
            .map(
              text => (
                <li
                  key={text}
                  className={css`
                    position: relative;
                    margin-top: 1rem;
                    font-size: 1.5rem;
                    font-family: 'Roboto', sans-serif;
                    color: #444;
                  `}
                >
                  {text}
                </li>
              )
            )}
        </ul>
        <h2 
          className={css`
            max-width: 40rem;
            font-family: 'Roboto', sans-serif;
            font-weight: 700;
            font-size: 3rem;
            margin-top: 4rem;
            color: #444;
          `}
        >
          Getting started
        </h2>
        <p
          className={css`
            position: relative;
            font-size: 1.25rem;
            font-family: 'Roboto', sans-serif;
            color: #444;

            margin-top: 1.5rem;
          `}
        >
          Run the following to bootstrap a new project
        </p>
        <code
          className={css`
            padding: 1rem;
            background-color: #eee;
            display: block;
            margin-top: 1rem;
            border-radius: 0.25rem;
            color: #28534d;
          `}
        >
          deno run -A -r https://deno.land/x/pangea/init.ts my-project-name
        </code>

        <p
          className={css`
            position: relative;
            font-size: 1.25rem;
            font-family: 'Roboto', sans-serif;
            color: #444;

            margin-top: 1.5rem;
          `}
        >
          Switch directories into your new project
        </p>
        <code
          className={css`
            padding: 1rem;
            background-color: #eee;
            display: block;
            margin-top: 1rem;
            border-radius: 0.25rem;
            color: #28534d;
          `}
        >
          cd my-project-name
        </code>
        
        <p
          className={css`
            position: relative;
            font-size: 1.25rem;
            font-family: 'Roboto', sans-serif;
            color: #444;

            margin-top: 1.5rem;
          `}
        >
          Run the dev server
        </p>
        <code
          className={css`
            padding: 1rem;
            background-color: #eee;
            display: block;
            margin-top: 1rem;
            border-radius: 0.25rem;
            color: #28534d;
          `}
        >
          deno task start
        </code>

        <p
          className={css`
            position: relative;
            font-size: 1.25rem;
            font-family: 'Roboto', sans-serif;
            color: #444;

            margin-top: 2rem;
          `}
        >
        You can now visit <a className={css`color: #4e43cb; &:hover { text-decoration: underline; }`} href='http://localhost:3000'>http://localhost:3000</a> to view the page.
        </p>

        <h2 
          className={css`
            max-width: 40rem;
            font-family: 'Roboto', sans-serif;
            font-weight: 700;
            font-size: 3rem;
            margin-top: 4rem;
            color: #444;
          `}
        >
          Example
        </h2>

        <p
          className={css`
            position: relative;
            font-size: 1.25rem;
            font-family: 'Roboto', sans-serif;
            color: #444;

            margin-top: 1.5rem;
          `}
        >
          The component below is referred to as an "island component". It was statically generated at the time the build script was run, with an initial value of 0. This component is hydrated on the client side, enabling the state to be updated with the buttons below.
        </p>

        <div
          className={css`
            margin-top: 1.5rem;
          `}
        >
          <Island
            path='src/islands/Counter.tsx'
            app={Counter}
            data={{ initialCount: 0 }}
          />
        </div>

        <h2 
          className={css`
            max-width: 40rem;
            font-family: 'Roboto', sans-serif;
            font-weight: 700;
            font-size: 3rem;
            margin-top: 4rem;
            color: #444;
          `}
        >
          Contribute
        </h2>

        <p
          className={css`
            position: relative;
            font-size: 1.25rem;
            font-family: 'Roboto', sans-serif;
            color: #444;

            margin-top: 1.5rem;
          `}
        >
          The code is hosted on GitHub at <a className={css`color: #4e43cb; &:hover { text-decoration: underline; }`} href='https://github.com/keastudio/pangea'>keastudio/pangea</a>. Contributions are welcome.
        </p>
      </div>
      <div
        className={css`
          position: relative;
          width: 100%;
          background-color: #21443f;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          padding: 1.5rem;
        `}
      >
        <p
          className={css`
            color: #fff;
            position: relative;
            font-size: 1.25rem;
            font-family: 'Roboto', sans-serif;
            text-align: center;
          `}
        >
          Created by <a className={css`color: #76ffec; &:hover { text-decoration: underline; }`} href='https://kea.studio' target='_blank' rel='noopener noreferrer'>Kea Studio</a>, and other great contributors
        </p>
      </div>
    </>
  )
}

const getStaticProps = () => {
  return {
    props: {
      title: 'Pangea - Deno Static Site Generator',
      description: 'Pangea is a static site generator built with Deno and the React.'
    }
  }
}

export { Page as default, getStaticProps }  
