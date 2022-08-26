import React from 'react'
import { Island } from '$pangea/src/Island.jsx'
import Counter from '../islands/Counter.jsx'

const Page = ({ title, servestApp }) => {
  return (
    <>
      <h1>{title}</h1>
      <Island
        servestApp={servestApp}
        path='src/islands/Counter.jsx'
        app={Counter}
        data={{ initialCount: 0 }}
      />
    </>
  )
}

const getStaticProps = async () => {
  return {
    props: {
      title: 'Hello World!'
    }
  }
}

export { Page as default, getStaticProps }
