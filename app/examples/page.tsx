import React from "react"
import { ExampleForm } from "./_components/example-form"

//TODO: shadcn form components w/ zod, react-hook-form integration implementation examples

export default function Example() {
  return (
    <div className='mx-auto h-full w-full max-w-5xl'>
      <div className='mt-10'>
        <ExampleForm />
      </div>
    </div>
  )
}
