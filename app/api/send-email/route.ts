import { NextRequest, NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_KJWKEP8s_FfbSMUVdnmxrA5H21SBJc2zC"

export async function POST(request: NextRequest) {
  try {
    const { to, name, subject, htmlContent, pdfAttachment } = await request.json()

    if (!to || !name || !subject || !htmlContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Prepare email data
    const emailData: any = {
      from: 'Lyzr Assessment <noreply@aadityanaharjain.online>',
      to: [to],
      subject: subject,
      html: htmlContent,
    }

    // Add PDF attachment if provided
    if (pdfAttachment) {
      emailData.attachments = [
        {
          filename: `Lyzr_Assessment_Report_${name.replace(/\s+/g, '_')}.pdf`,
          content: pdfAttachment,
          type: 'application/pdf',
          disposition: 'attachment',
        }
      ]
    }

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Resend API error:', errorData)
      throw new Error(`Resend API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      messageId: result.id,
      message: 'Email sent successfully'
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
