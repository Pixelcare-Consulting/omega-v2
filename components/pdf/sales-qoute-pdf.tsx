import { getSaleQuoteByCode } from "@/actions/sale-quote"
import { BASE_URL } from "@/constant/common"
import { formatCurrency, formatNumber } from "@/lib/formatter"
import { renderValue } from "@/lib/pdf-utils"
import { LineItemForm } from "@/schema/sale-quote"
import { Page, Text, View, Document, StyleSheet, Font, Link } from "@react-pdf/renderer"
import { add, multiply } from "mathjs"
import { useMemo, useState } from "react"

Font.register({
  family: "ArialNovaRegular",
  src: `${BASE_URL}/fonts/arial-nova/arial-nova-regular.ttf`,
})

Font.register({
  family: "ArialNovaBold",
  src: `${BASE_URL}/fonts/arial-nova/arial-nova-bold.ttf`,
})

//? 1 inch = 72 pt

const styles = StyleSheet.create({
  body: {
    position: "relative",
    fontFamily: "ArialNovaRegular",
    width: "100%",
    height: "100%",
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 150,
    fontSize: 8,
  },
  tableContainer: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid #00000",
    borderBottom: "none",
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderBottom: "1px solid #00000",
  },
  tableColumnHeaderNoBorder: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "center",
    height: "100%",
    padding: 4,
    fontFamily: "ArialNovaBold",
  },
  tableColumnNoBorder: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "center",
    height: "100%",
    padding: 4,
  },
  tableColumnHeaderWithBorder: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "center",
    height: "100%",
    padding: 4,
    fontFamily: "ArialNovaBold",
    borderLeft: "1px solid #00000",
  },
  tableColumnWithBorder: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "center",
    height: "100%",
    padding: 4,
    borderLeft: "1px solid #00000",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
})

type SalesQuotationPdfProps = {
  salesQuote: NonNullable<Awaited<ReturnType<typeof getSaleQuoteByCode>>>
  billTo?: string
  shipTo?: string
  lineItems: LineItemForm[]
  paymentTerms: any
}

export default function SalesQuotationPdf({ salesQuote, lineItems, paymentTerms, billTo, shipTo }: SalesQuotationPdfProps) {
  const [totalPages, setTotalPages] = useState(0)

  const total = lineItems.reduce((acc, item) => {
    if (!item) return acc
    return add(acc, multiply(item.unitPrice, item.quantity))
  }, 0)

  const paymentTerm = useMemo(() => {
    return paymentTerms?.find((term: any) => term.GroupNum === salesQuote.paymentTerms)?.PymntGroup
  }, [JSON.stringify(paymentTerms)])

  return (
    <Document
      onRender={(props: any) => {
        //* get total pages stored in a state
        const value = props?._INTERNAL__LAYOUT__DATA_?.children?.length || 0
        setTotalPages(value)
      }}
    >
      <Page size='A4' style={styles.body} wrap>
        <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Text style={{ fontFamily: "ArialNovaBold" }}>Omega Global Technologies, Inc.</Text>

            <Text>19 Great Oaks Blvd, Ste 30</Text>

            <Text>San Jose CA 95119</Text>

            <Text style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontFamily: "ArialNovaBold" }}>Ph: </Text>408-225-8318
            </Text>

            <Text style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontFamily: "ArialNovaBold" }}>Email: </Text>jalfonso@omegagti.com
            </Text>
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",

              gap: 4,
            }}
          >
            <Text style={{ fontFamily: "ArialNovaBold", fontSize: 15 }}>Sales Quote</Text>

            <View style={{ border: "1px solid #00000" }}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "ArialNovaBold",
                    fontSize: 13,
                    marginBottom: 15,
                    marginTop: 10,
                    marginLeft: 35,
                    marginRight: 35,
                  }}
                >
                  {renderValue(salesQuote.code)}
                </Text>
              </View>

              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#828282",
                }}
              >
                <Text style={{ fontFamily: "ArialNovaBold", fontSize: 8, paddingTop: 4, paddingBottom: 4 }}>SALES QUOTE DATE</Text>
              </View>

              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "ArialNovaBold",
                    textAlign: "center",
                    fontSize: 10,
                    marginTop: 5,
                    marginBottom: 10,
                    marginLeft: 35,
                    marginRight: 35,
                  }}
                >
                  {renderValue(salesQuote.date, "MM/dd/yyyy")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.tableContainer, { marginTop: 15 }]}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColumnHeaderNoBorder, { justifyContent: "flex-start", width: "50%" }]}>
              <Text style={{ fontFamily: "ArialNovaBold" }}>Bill To:</Text>
              <Text></Text>
            </View>

            <View style={[styles.tableColumnHeaderWithBorder, { justifyContent: "flex-start", width: "50%" }]}>
              <Text style={{ fontFamily: "ArialNovaBold" }}>To:</Text>
              <Text></Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableColumnNoBorder, { justifyContent: "flex-start", width: "50%" }]}>
              <Text>{renderValue(salesQuote.billTo)}</Text>
              {/* <Text>{renderValue(billTo)}</Text> */} {/* //* temp comment */}
              <Text style={{ width: "100%" }}>Customer ID: {renderValue(salesQuote.customerCode)}</Text>
            </View>

            <View style={[styles.tableColumnWithBorder, { justifyContent: "flex-start", width: "50%" }]}>
              <Text>{salesQuote.shipTo}</Text>
              {/* <Text>{shipTo}</Text> */} {/* //* temp comment */}
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableColumnNoBorder, { justifyContent: "flex-start", width: "50%" }]}>
              <Text>Contact: {renderValue("")}</Text>
            </View>

            <View style={[styles.tableColumnWithBorder, { justifyContent: "flex-start", width: "50%" }]}>
              <Text></Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableColumnHeaderNoBorder, { width: "20%", backgroundColor: "#828282" }]}>
              <Text>Sales Rep</Text>
            </View>

            <View style={[styles.tableColumnHeaderWithBorder, { width: "20%", backgroundColor: "#828282" }]}>
              <Text>Payment Terms</Text>
            </View>

            <View style={[styles.tableColumnHeaderWithBorder, { width: "20%", backgroundColor: "#828282" }]}>
              <Text>FOB Point</Text>
            </View>

            <View style={[styles.tableColumnHeaderWithBorder, { width: "20%", backgroundColor: "#828282" }]}>
              <Text>Shipping Method</Text>
            </View>

            <View style={[styles.tableColumnHeaderWithBorder, { width: "20%", backgroundColor: "#828282" }]}>
              <Text>Valid Until</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableColumnNoBorder, { width: "20%" }]}>
              <Text>{renderValue(salesQuote.salesRep.name || salesQuote.salesRep.email)}</Text>
            </View>

            <View style={[styles.tableColumnWithBorder, { width: "20%" }]}>
              <Text>{renderValue(paymentTerm)}</Text>
            </View>

            <View style={[styles.tableColumnWithBorder, { width: "20%" }]}>
              <Text>{renderValue(salesQuote.fobPoint)}</Text>
            </View>

            <View style={[styles.tableColumnWithBorder, { width: "20%" }]}>
              <Text>{renderValue(salesQuote.shippingMethod)}</Text>
            </View>

            <View style={[styles.tableColumnWithBorder, { width: "20%" }]}>
              <Text>{renderValue(salesQuote.validUntil, "MM/dd/yyyy")}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableColumnHeaderNoBorder, { width: "18%", backgroundColor: "#828282" }]}>
              <Text>MPN</Text>
            </View>

            <View style={[styles.tableColumnHeaderWithBorder, { backgroundColor: "#828282", width: "32%" }]}>
              <Text>Description</Text>
            </View>

            <View style={[styles.tableColumnHeaderWithBorder, { width: "18%", backgroundColor: "#828282" }]}>
              <Text>Unit Price</Text>
            </View>

            <View style={[styles.tableColumnHeaderWithBorder, { width: "17%", backgroundColor: "#828282" }]}>
              <Text>Quantity Quoted</Text>
            </View>

            <View style={[styles.tableColumnHeaderWithBorder, { width: "17%", backgroundColor: "#828282" }]}>
              <Text>Total Price</Text>
            </View>
          </View>

          {lineItems &&
            lineItems.map((li: any) => {
              const x = parseFloat(String(li.unitPrice))
              const y = parseFloat(String(li.quantity))

              const unitPrice = isNaN(x) ? 0 : x
              const quantity = isNaN(y) ? 0 : y
              const totalPrice = unitPrice * quantity

              return (
                <View key={li.code} style={styles.tableRow}>
                  <View style={[styles.tableColumnNoBorder, { width: "18%" }]}>
                    <Text style={{ width: "100%" }}>{renderValue(li.code)}</Text>
                    <Text style={{ width: "100%" }}>MFR: {renderValue(li.mfr)}</Text>
                  </View>

                  <View style={[styles.tableColumnWithBorder, { width: "32%" }]}>
                    <Text style={{ width: "100%" }}>CPN: {renderValue(li.cpn)}</Text>
                    <Text style={{ width: "100%" }}>Desc: {renderValue(li.name)}</Text>
                    <Text style={{ width: "100%" }}>D.C: {renderValue(li.dateCode)}</Text>
                    <Text style={{ width: "100%" }}>Est. Del. Date: {renderValue(li.estimatedDeliveryDate, "MM/dd/yyyy")}</Text>
                  </View>

                  <View style={[styles.tableColumnWithBorder, { width: "18%" }]}>
                    <Text>{renderValue(formatCurrency({ amount: unitPrice, minDecimal: 2 }))}</Text>
                  </View>

                  <View style={[styles.tableColumnWithBorder, { width: "17%" }]}>
                    <Text>{renderValue(formatNumber({ amount: quantity }))}</Text>
                  </View>

                  <View style={[styles.tableColumnWithBorder, { width: "17%" }]}>
                    <Text>{renderValue(formatCurrency({ amount: totalPrice, minDecimal: 2 }))}</Text>
                  </View>
                </View>
              )
            })}
        </View>

        <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              width: "51%",
              border: "1px solid #00000",
              borderTop: "none",
              padding: 4,
              gap: 4,
            }}
          >
            <View style={{ width: "100%", display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
              <Text style={{ width: "50%", fontFamily: "ArialNovaBold", textAlign: "right" }}>Subtotal:</Text>
              <Text style={{ width: "50%", textAlign: "right" }}>{renderValue(formatCurrency({ amount: total, maxDecimal: 2 }))}</Text>
            </View>

            <View style={{ width: "100%", display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
              <Text style={{ width: "50%", fontFamily: "ArialNovaBold", textAlign: "right" }}>Tax:</Text>
              <Text style={{ width: "50%", fontFamily: "ArialNovaBold", textAlign: "right" }}>$- </Text>
            </View>

            <View style={{ width: "100%", display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
              <Text style={{ width: "50%", fontFamily: "ArialNovaBold", textAlign: "right" }}>TOTAL:</Text>
              <Text style={{ width: "50%", fontFamily: "ArialNovaBold", textAlign: "right" }}>
                {renderValue(formatCurrency({ amount: total, maxDecimal: 2 }))}
              </Text>
            </View>
          </View>
        </View>

        {/* //* footer */}
        <View
          fixed
          style={styles.footer}
          render={({ pageNumber }) => (
            <>
              {pageNumber === totalPages && (
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 100,
                  }}
                >
                  <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "center", width: "70%", gap: 10 }}>
                    <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 1 }}>
                      <Text>Approval: </Text>
                      <Text style={{ borderBottom: "1px solid #00000", paddingBottom: 1 }}>
                        {renderValue(salesQuote.approval.name || salesQuote.approval.email)}
                      </Text>
                    </View>

                    <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 1 }}>
                      <Text>Date: </Text>
                      <Text style={{ borderBottom: "1px solid #00000", paddingBottom: 1 }}>
                        {renderValue(salesQuote.approvalDate, "MM/dd/yyyy")}
                      </Text>
                    </View>

                    <View style={{ width: "100%", fontSize: 7.5 }}>
                      <Text>1. All quotes are subject to reconfirmation upon receipt of PO</Text>
                      <Text>2. All orders are NCNR</Text>
                    </View>

                    <View style={{ width: "100%", fontSize: 7.5 }}>
                      <Text>Parts will be deemed accepted and will be shipped 7 days after report is sent to the customer</Text>
                      <Text>If test reports are requested/required, customer will have 7 days upon receipt to report any</Text>
                      <Text>concerns or comments before parts are deemed accepted and shipped.</Text>
                    </View>

                    <View style={{ width: "100%", fontSize: 7.5 }}>
                      <Text style={{ textDecoration: "underline", fontFamily: "ArialNovaBold", marginBottom: 2 }}>
                        Omega GTI Sales Terms & Conditions
                      </Text>

                      <Text>
                        <Link src='https://iris.omegagti.com/terms/OmegaGTITerms&Conditions.pdf'>
                          https://iris.omegagti.com/terms/OmegaGTITerms&Conditions.pdf
                        </Link>
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View
                style={{
                  width: "100%",
                  fontSize: 7.5,
                  marginTop: 10,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text>{renderValue(new Date(), "MM/dd/yyyy hh:mm a")}</Text>
                <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
              </View>
            </>
          )}
        ></View>
      </Page>
    </Document>
  )
}
