"use client"

import AutoResizeTextAreaField from "@/components/form/auto-resize-textarea-field"
import CheckboxField from "@/components/form/checkbox-field"
import CheckboxGroupField from "@/components/form/checkbox-group-field"
import { ComboboxField } from "@/components/form/combobox-field"
import DatePickerField from "@/components/form/date-picker-field"
import { FormDebug } from "@/components/form/form-debug"
import InputField from "@/components/form/input-field"
import MonthPickerField from "@/components/form/month-picker-field"
import MultiSelectField from "@/components/form/multi-select-field"
import RadioGroupField from "@/components/form/radio-group-field"
import SelectField from "@/components/form/select-field"
import SwitchField from "@/components/form/switch-field"
import TextAreaField from "@/components/form/textarea-field"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

const postType = [
  { value: "project", label: "Project" },
  { value: "blog", label: "Blog" },
  { value: "announcement", label: "Announcement" },
  { value: "news", label: "News" },
  { value: "event", label: "Event" },
  { value: "tutorial", label: "Tutorial" },
  { value: "update", label: "Update" },
  { value: "review", label: "Review" },
  { value: "interview", label: "Interview" },
  { value: "case-study", label: "Case Study" },
]

const gender = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "others", label: "Others" },
]

const favoriteColors = [
  { value: "red", label: "Red" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "yellow", label: "Yellow" },
  { value: "purple", label: "Purple" },
  { value: "orange", label: "Orange" },
  { value: "pink", label: "Pink" },
  { value: "black", label: "Black" },
  { value: "white", label: "White" },
  { value: "gray", label: "Gray" },
]

const framework = [
  { value: "react", label: "React.js" },
  { value: "angular", label: "Angular" },
  { value: "vue", label: "Vue.js" },
  { value: "django", label: "Django" },
  { value: "flask", label: "Flask" },
  { value: "spring", label: "Spring" },
  { value: "express", label: "Express.js" },
  { value: "laravel", label: "Laravel" },
  { value: "node.js", label: "Node.js" },
  { value: "asp_net", label: "ASP.NET" },
]

const exampleFormSchema = z.object({
  name: z.string().min(1, { message: "Please enter a name." }),
  age: z.coerce.number().min(1, { message: "Please enter an age." }).optional(),
  email: z.string().min(1, { message: "Please enter an email." }).email({ message: "Please enter a valid email." }),
  d1: z.date({ message: "Please enter a valid date." }),
  d2: z.date({ message: "Please enter a valid date." }),
  postType: z.string().min(1, { message: "Please select a post type." }),
  description: z.string().min(1, { message: "Please enter a description." }),
  body: z.string().min(1, { message: "Please enter a body." }),
  gender: z.string().min(1, { message: "Please select gender" }),
  isAgree: z.boolean().default(false),
  favoriteColor: z.array(z.string()).min(1, { message: "Please select at least one favorite color." }),
  isDefault: z.boolean().default(false),
  framework: z.string().min(1, { message: "Please select a framework." }),
  frameworks: z.array(z.string()).min(1, { message: "Please select atleast one framework." }),
})

export type ExampleFormValues = z.infer<typeof exampleFormSchema>

//* Sample implementation of Form components
export function ExampleForm() {
  const form = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      framework: "",
      postType: "",
      description: "",
      body: "",
      frameworks: [],
      favoriteColor: [],
    },
    resolver: zodResolver(exampleFormSchema),
  })

  const handleSubmit = (data: any) => {
    console.log("submitted", data)
  }

  return (
    <>
      <FormDebug form={form} />

      <Form {...form}>
        <form className='my-5' onSubmit={form.handleSubmit(handleSubmit)}>
          <div className='mb-10'>
            <h1 className='text-xl font-bold'>Example Form</h1>
            <p className='text-sm text-muted-foreground'>Form example with Zod validation and React Hook Form integration.</p>
          </div>

          <div className='mb-5 space-y-2'>
            <h1 className='text-lg font-bold'>Input Field</h1>
            <InputField
              control={form.control}
              name='email'
              label='Email'
              extendedProps={{ inputProps: { placeholder: "Email" } }}
              isRequired
            />
            <InputField
              control={form.control}
              name='name'
              label='Name'
              extendedProps={{ inputProps: { placeholder: "Name" } }}
              isRequired
            />
          </div>

          <div className='mb-5 space-y-2'>
            <h1 className='text-lg font-bold'>Date Picker</h1>
            <DatePickerField
              control={form.control}
              name='d1'
              label='Date 1'
              extendedProps={{
                calendarProps: { mode: "single", fromYear: 1800, toYear: new Date().getFullYear(), captionLayout: "dropdown-buttons" },
              }}
              isRequired
            />

            <MonthPickerField control={form.control} name='d2' label='Date 2' isRequired />
          </div>

          <div className='mb-5 space-y-2'>
            <h1 className='text-lg font-bold'>Text Area</h1>
            <TextAreaField control={form.control} name='description' label='Description' isRequired />

            <h1 className='text-lg font-bold'>Auto Adjust Text Area</h1>
            <AutoResizeTextAreaField
              control={form.control}
              name='body'
              label='Body'
              extendedProps={{ autoResizeTextAreaProps: { maxHeight: 200 } }}
              isRequired
            />
          </div>

          <div className='mb-5 space-y-2'>
            <h1 className='text-lg font-bold'>Combobox</h1>

            <ComboboxField
              data={framework}
              control={form.control}
              name='framework'
              label='Framework'
              isRequired

              //   isLoading
            />

            <SelectField
              data={postType}
              control={form.control}
              name='postType'
              label='Post Type'
              isRequired
              //   isLoading
            />

            <h1 className='text-lg font-bold'>Multi Select</h1>
            <MultiSelectField data={framework} control={form.control} name='frameworks' label='Frameworks' />
          </div>

          <div className='mb-5 space-y-2'>
            <h1 className='text-lg font-bold'>Radio Group</h1>
            <RadioGroupField
              data={gender}
              control={form.control}
              name='gender'
              label='Gender'
              extendedProps={{ radioGroupProps: { className: "flex gap-3" } }}
            />
          </div>

          <div className='mb-5 space-y-2'>
            <h1 className='text-lg font-bold'>Checkbox</h1>

            <CheckboxField
              control={form.control}
              name='isAgree'
              label='Accept terms and conditions'
              //   description='this is a checkbox field.'
            />

            <h1 className='text-lg font-bold'>Checkbox Group</h1>

            <CheckboxGroupField
              data={favoriteColors}
              control={form.control}
              name='favoriteColor'
              label='Favorite Color'
              description='This is a sample checkbox group'
              extendedProps={{ checkboxGroupProps: { className: "flex flex-wrap gap-3" } }}
            />
          </div>

          <div className='mb-5 space-y-2'>
            <h1 className='text-lg font-bold'>Switch</h1>

            <SwitchField
              control={form.control}
              layout='default'
              name='isDefault'
              label='Default Mode'
              description='This is a sample switch description.'
            />

            <SwitchField
              control={form.control}
              layout='centered'
              name='isDefault'
              label='Default Mode'
              description='This is a sample switch description.'
            />

            <SwitchField
              control={form.control}
              layout='wide'
              name='isDefault'
              label='Default Mode'
              description='This is a sample switch description.'
            />
          </div>

          <div className='flex justify-end'>
            <Button className='mt-3' type='submit'>
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}
