import React from 'react'
import { Island } from '$pangea/src/Island.ts'
import Counter from '../islands/Counter.tsx'

const Page = ({ title, servestApp }: { title: string, servestApp: any }) => {
  return (
    <>
      <h1>{title}</h1>
      <Island
        servestApp={servestApp}
        path='src/islands/Counter.tsx'
        app={Counter}
        data={{ initialCount: 0 }}
      />
    </>
  )
}

const getStaticProps = () => {
  return {
    props: {
      title: 'Hello World!'
    }
  }
}

export { Page as default, getStaticProps }
