"use client"

import { PageLayout } from "@/app/(protected)/_components/page-layout"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { TabsContent } from "@radix-ui/react-tabs"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SupplierForm() {
  const router = useRouter()

  const [showStrength, setShowStrength] = useState(true)
  const [showContact, setShowContact] = useState(true)

  const [openAdress, setOpenAdress] = useState(false)
  const [openProductStrength, setOpenProductStrength] = useState(false)
  const [openMFRStrength, setOpenMFRStrength] = useState(false)

  return (
    <PageLayout title='Supplier' description='Add and manage supplier profiles, contacts, and related information.'>
      <Card className='shadow-none'>
        <CardContent className='space-y-6'>
          {/* supplier info */}
          <div className='grid grid-cols-12 gap-x-6 gap-y-4 py-8'>
            <div className='col-span-12 md:col-span-6 lg:col-span-4'>
              <Label htmlFor='companyName' className='mr-1'>
                Company Name<span className='text-red-500'>*</span>
              </Label>
              <Input id='companyName' />
            </div>

            <div className='col-span-12 md:col-span-6 lg:col-span-4'>
              <Label htmlFor='accountNumber' className='mr-1'>
                Account #<span className='text-red-500'>*</span>
              </Label>
              <Input id='accountNumber' />
            </div>

            <div className='col-span-12 lg:col-span-4'>
              <Label>Assigned Buyer</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder='Select Assigned Buyer' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='1'>Abdu Abdoulmalwa</SelectItem>
                  <SelectItem value='2'>Aldie Arambulo</SelectItem>
                  <SelectItem value='3'>Alecia Sandoval</SelectItem>
                  <SelectItem value='4'>Amanda Miner</SelectItem>
                  <SelectItem value='5'>Annie Nyugen</SelectItem>
                  <SelectItem value='5'>Arabelle Maranan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='col-span-12'>
              <h1 className='font-semibold'>Main Address</h1>
              <p className='text-sm text-muted-foreground'>Supplier main address details</p>
            </div>

            <div className='col-span-12'>
              <Popover open={openAdress} onOpenChange={setOpenAdress}>
                <PopoverTrigger asChild>
                  <Button variant='outline' role='combobox' className='h-full w-full justify-between'>
                    Search for an addressz
                    <Icons.chevUpDown className='opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='max-h-[--radix-popover-content-available-height] w-[--radix-popover-trigger-width] p-0'>
                  <Command className='w-full'>
                    <CommandInput placeholder='Search framework...' />
                    <CommandList>
                      <CommandEmpty>No address found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem>Manila, Philipppines</CommandItem>
                        <CommandItem>California, United States</CommandItem>
                        <CommandItem>New York, United States</CommandItem>
                        <CommandItem>London, United Kingdom</CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className='col-span-12 grid grid-cols-12 gap-x-6 gap-y-4'>
              <div className='col-span-12 lg:col-span-6'>
                <Label htmlFor='street1'>Street 1</Label>
                <Input id='street1' />
              </div>

              <div className='col-span-12 lg:col-span-6'>
                <Label htmlFor='street2'>Street 2</Label>
                <Input id='street2' />
              </div>

              <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                <Label htmlFor='city'>City</Label>
                <Input id='city' />
              </div>

              <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                <Label htmlFor='stateRegion'>State/Region</Label>
                <Input id='stateRegion' />
              </div>

              <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                <Label htmlFor='postalcode'>Postal Code</Label>
                <Input id='postalcode' />
              </div>

              <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                <Label>Country</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder='Select Country' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='1'>Philippines</SelectItem>
                    <SelectItem value='2'>United State</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* strength */}
            <div className='col-span-12 mt-5 grid grid-cols-12 gap-x-6 gap-y-4'>
              <div>
                <Button variant='ghost' onClick={() => setShowStrength((prev) => !prev)} className='flex items-center gap-2'>
                  {showStrength ? <Icons.chevDown className='h-5 w-5' /> : <Icons.chevUp className='h-5 w-5' />}
                  Strenth
                </Button>
              </div>

              {showStrength && (
                <div className='col-span-12 grid grid-cols-12 gap-x-6 gap-y-4'>
                  <div className='col-span-12 md:col-span-4'>
                    <Popover
                      open={openProductStrength}
                      onOpenChange={(v) => {
                        setOpenProductStrength(v)
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button variant='outline' role='combobox' className='h-full w-full justify-between'>
                          Product Strength
                          <Icons.chevUpDown className='opacity-50' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='max-h-[--radix-popover-content-available-height] w-[--radix-popover-trigger-width] p-0'>
                        <Command className='w-full'>
                          <CommandInput placeholder='Search Choices...' />
                          <CommandList>
                            <CommandEmpty>No product strenth found.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem>
                                <Checkbox /> Caps
                              </CommandItem>
                              <CommandItem>
                                <Checkbox /> Connectors
                              </CommandItem>
                              <CommandItem>
                                <Checkbox /> CPUs
                              </CommandItem>
                              <CommandItem>
                                <Checkbox /> Crystal Oscilator
                              </CommandItem>
                              <CommandItem>
                                <Checkbox /> DIMM
                              </CommandItem>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className='col-span-12 md:col-span-4'>
                    <Popover open={openMFRStrength} onOpenChange={setOpenMFRStrength}>
                      <PopoverTrigger asChild>
                        <Button variant='outline' role='combobox' className='h-full w-full justify-between'>
                          MFR Strength
                          <Icons.chevUpDown className='opacity-50' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='max-h-[--radix-popover-content-available-height] w-[--radix-popover-trigger-width] p-0'>
                        <Command className='w-full'>
                          <CommandInput placeholder='Search Choices...' />
                          <CommandList>
                            <CommandEmpty>No product strenth found.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem>
                                <Checkbox /> 3M
                              </CommandItem>
                              <CommandItem>
                                <Checkbox /> Altera
                              </CommandItem>
                              <CommandItem>
                                <Checkbox /> AMD
                              </CommandItem>
                              <CommandItem>
                                <Checkbox /> Amphenol
                              </CommandItem>
                              <CommandItem>
                                <Checkbox /> Analog Devices (AD)
                              </CommandItem>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>

            {/* Contact */}
            <div className='col-span-12 mt-5 grid grid-cols-12 gap-x-6 gap-y-4'>
              <div>
                <Button variant='ghost' onClick={() => setShowContact((prev) => !prev)} className='flex items-center gap-2'>
                  {showContact ? <Icons.chevDown className='h-5 w-5' /> : <Icons.chevUp className='h-5 w-5' />}
                  Contact
                </Button>
              </div>

              {showContact && (
                <div className='col-span-12 flex flex-col gap-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Button size='sm' variant='ghost'>
                        <Icons.plus className='size-4' /> New Contact
                      </Button>

                      <Button size='sm' variant='ghost'>
                        <Icons.chevDown className='size-4' /> More
                      </Button>
                    </div>

                    <div className='text-sm font-semibold text-primary'>0 Contact records</div>
                  </div>

                  <Table className='col-span-12'>
                    <TableHeader className='w-full'>
                      <TableRow>
                        <TableHead>&nbsp;</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Title/Job Function</TableHead>
                        <TableHead>Direct Phone</TableHead>
                        <TableHead>Email Address</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>ID #</TableHead>
                        <TableHead>Contact Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className='w-full'>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell></TableCell>
                          <TableCell>&nbsp;</TableCell>
                          <TableCell>&nbsp;</TableCell>
                          <TableCell>&nbsp;</TableCell>
                          <TableCell>&nbsp;</TableCell>
                          <TableCell>&nbsp;</TableCell>
                          <TableCell>&nbsp;</TableCell>
                          <TableCell>&nbsp;</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Others */}
            <div className='col-span-12 mt-5'>
              <Tabs defaultValue='1' className='w-full border-0'>
                <TabsList className='row-gap-3 lex mb-2 h-fit flex-wrap items-center'>
                  <TabsTrigger value='1'>Qualification Data</TabsTrigger>
                  <TabsTrigger value='2'>Supplier Quotes</TabsTrigger>
                  <TabsTrigger value='3'>Supplier Offers</TabsTrigger>
                  <TabsTrigger value='4'>Shipments</TabsTrigger>
                  <TabsTrigger value='5'>Product Availability</TabsTrigger>
                  <TabsTrigger value='6'>Events</TabsTrigger>
                  <TabsTrigger value='7'>Activities</TabsTrigger>
                  <TabsTrigger value='8'>Notes</TabsTrigger>
                  <TabsTrigger value='9'>Strategic Suppliers</TabsTrigger>
                  <TabsTrigger value='10'>Changes to Supplier</TabsTrigger>
                </TabsList>

                <TabsContent value='1'>
                  <Card className='shadow-none'>
                    <CardContent>
                      <div className='grid grid-cols-12 gap-x-6 gap-y-4 py-8'>
                        <div className='col-span-6 md:col-span-6 lg:col-span-4'>
                          <Label className='mr-1'>
                            Status<span className='text-red-500'>*</span>
                          </Label>

                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder='Select status' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='1'>Approved</SelectItem>
                              <SelectItem value='2'>Denied</SelectItem>
                              <SelectItem value='3'>Provisional</SelectItem>
                              <SelectItem value='4'>Pre-Qualified</SelectItem>
                              <SelectItem value='5'>Qual. In Process</SelectItem>
                              <SelectItem value='6'>Qual. Not Started</SelectItem>
                              <SelectItem value='7'>Waiting for Approval</SelectItem>
                              <SelectItem value='8'>Condionally Approved</SelectItem>
                              <SelectItem value='9'>Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className='col-span-6 md:col-span-6 lg:col-span-4'>
                          <Label className='mr-1'>
                            Tier Level<span className='text-red-500'>*</span>
                          </Label>

                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder='Select status' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='1'>1 - MFR</SelectItem>
                              <SelectItem value='2'>1 - DIST</SelectItem>
                              <SelectItem value='3'>2 - OEM</SelectItem>
                              <SelectItem value='4'>2 - CM</SelectItem>
                              <SelectItem value='5'>3 - Open MKT (US)</SelectItem>
                              <SelectItem value='6'>4 - Open MKT (INTL)</SelectItem>
                              <SelectItem value='7'>Test House</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className='col-span-6 flex flex-col justify-end md:col-span-6 lg:col-span-4'>
                          <div className='flex items-center gap-2 text-sm'>
                            <Checkbox /> Compliant AS
                          </div>
                          <div className='flex items-center gap-2 text-sm'>
                            <Checkbox /> Compliant to ITAR
                          </div>
                        </div>

                        <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                          <Label className='mr-1'>Terms</Label>

                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder='Select terms' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='0'>1 % days / net 30</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                          <Label className='mr-1'>Warranty Period</Label>

                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder='Select warranty period' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='0'>60 Days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                          <Label className='mr-1'>New Original Only</Label>

                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder='Select New Original only' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='0'>Ask</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                          <Label htmlFor='minPo'>Minimum PO</Label>
                          <Input id='minPo' />
                        </div>

                        <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                          <Label htmlFor='omegaReviews'>Omega Reviews</Label>
                          <Textarea id='omegaReviews' className='resize-none' rows={2} />
                        </div>

                        <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                          <Label htmlFor='updateToStatus'>Update to Status</Label>
                          <Textarea id='updateToStatus' className='resize-none' rows={2} />
                        </div>

                        <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                          <Label htmlFor='reasonDenied'>Reason Denied</Label>
                          <Textarea id='reasonDenied' className='resize-none' rows={2} />
                        </div>

                        <div className='col-span-12 md:col-span-6 lg:col-span-3'>
                          <Label htmlFor='notes2'>Notes2</Label>
                          <Textarea id='notes2' className='resize-none' rows={2} />
                        </div>

                        <div className='col-span-12 flex flex-col items-center justify-center md:flex-row md:items-center md:justify-between'>
                          <div>
                            <h1 className='font-semibold'>Manage Documents</h1>
                            <p className='text-sm text-muted-foreground'>Add single or multiple documents</p>
                          </div>

                          <div className='flex items-center gap-2 py-3'>
                            <Button variant='outline'>
                              <Icons.plus className='size-4' /> Add Document
                            </Button>

                            <Button variant='outline'>
                              <Icons.plus className='size-4' /> Add Multiple Documents
                            </Button>
                          </div>
                        </div>

                        <div className='col-span-12 flex flex-col gap-4'>
                          <div className='flex flex-col items-center justify-center md:flex-row md:items-center md:justify-between'>
                            <div className='flex items-center gap-2'>
                              <Button size='sm' variant='ghost'>
                                <Icons.plus className='size-4' /> New Documents
                              </Button>

                              <Button size='sm' variant='ghost'>
                                <Icons.chevDown className='size-4' /> More
                              </Button>
                            </div>

                            <div className='text-sm font-semibold text-primary'>0 Document records</div>
                          </div>

                          <Table className='col-span-12'>
                            <TableHeader className='w-full'>
                              <TableRow>
                                <TableHead>&nbsp;</TableHead>
                                <TableHead>Date Created</TableHead>
                                <TableHead>Document Name</TableHead>
                                <TableHead>Note</TableHead>
                                <TableHead>Document File</TableHead>
                                <TableHead>
                                  Supplier Requision <br /> - Record ID (Reference Proxy)
                                </TableHead>
                                <TableHead>Shipment SO Number</TableHead>
                                <TableHead>
                                  Shipment - Related <br />
                                  Supplier Quote
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody className='w-full'>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                  <TableCell></TableCell>
                                  <TableCell>&nbsp;</TableCell>
                                  <TableCell>&nbsp;</TableCell>
                                  <TableCell>&nbsp;</TableCell>
                                  <TableCell>&nbsp;</TableCell>
                                  <TableCell>&nbsp;</TableCell>
                                  <TableCell>&nbsp;</TableCell>
                                  <TableCell>&nbsp;</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        <div className='col-span-12'>
                          <div className='flex flex-wrap items-center gap-x-10 gap-y-3'>
                            <div className='flex items-center gap-2 text-sm'>
                              <Checkbox /> Supplier Assessment
                            </div>

                            <div className='flex items-center gap-2 text-sm'>
                              <Checkbox /> Supplier Questionaire
                            </div>

                            <div className='flex items-center gap-2 text-sm'>
                              <Checkbox /> Company Registration
                            </div>

                            <div className='flex items-center gap-2 text-sm'>
                              <Checkbox />
                              Omega QC Acknowledgement
                            </div>

                            <div className='flex items-center gap-2 text-sm'>
                              <Checkbox />
                              Trade Refs
                            </div>

                            <div className='flex items-center gap-2 text-sm'>
                              <Checkbox />
                              TR 1
                            </div>

                            <div className='flex items-center gap-2 text-sm'>
                              <Checkbox />
                              TR 2
                            </div>

                            <div className='flex items-center gap-2 text-sm'>
                              <Checkbox />
                              TR 3
                            </div>

                            <div className='flex items-center gap-2 text-sm'>
                              <Checkbox />
                              TR 4
                            </div>

                            <div className='flex items-center gap-2 text-sm'>
                              <Checkbox />
                              TR 5
                            </div>
                          </div>
                        </div>

                        <div className='col-span-6 md:col-span-6 lg:col-span-4'>
                          <Label htmlFor='qualificationNotes'>Qualification Notes</Label>
                          <Textarea id='qualificationNotes' className='resize-none' rows={2} />
                        </div>
                      </div>

                      <div className='flex gap-2'>
                        <Button>Save</Button>
                        <Button variant='secondary'>Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {Array.from({ length: 11 }).map(
                  (_, i) =>
                    i >= 2 &&
                    i <= 11 && (
                      <TabsContent key={i} value={String(i)}>
                        <Card className='shadow-none'>
                          <CardContent className='flex items-center justify-center'>
                            <div className='mt-10 text-center'>
                              <h1 className='text-base font-semibold'>Coming Soon</h1>
                              <p className='text-sm text-muted-foreground'>Currently under development</p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    )
                )}
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
