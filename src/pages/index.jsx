import React from 'react'

const Page = ({ title }) => {
  return (
    <>
      <h1>{title}</h1>
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
