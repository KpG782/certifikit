import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      subject,
      message,
      certificateImage,
      recipientName,
      // Optional: Customizable email branding (for n8n)
      email_header_title,
      email_header_subtitle,
      email_footer_company,
      email_footer_dept,
      email_sender_name,
      primary_color,
      secondary_color,
    } = body;

    // Validation
    if (!email || !subject || !message || !certificateImage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get n8n webhook URL from environment variables
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      console.error("N8N_WEBHOOK_URL not configured");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    // Prepare payload for n8n webhook (matching n8n code format)
    const payload: any = {
      recipient_email: email,
      recipient_name: recipientName || "Recipient",
      certificate_image: certificateImage,
      subject: subject,
      message: message,
      timestamp: new Date().toISOString(),
    };

    // Add optional branding fields if provided (for customizable emails)
    if (email_header_title) payload.email_header_title = email_header_title;
    if (email_header_subtitle)
      payload.email_header_subtitle = email_header_subtitle;
    if (email_footer_company)
      payload.email_footer_company = email_footer_company;
    if (email_footer_dept) payload.email_footer_dept = email_footer_dept;
    if (email_sender_name) payload.email_sender_name = email_sender_name;
    if (primary_color) payload.primary_color = primary_color;
    if (secondary_color) payload.secondary_color = secondary_color;

    // Send data to n8n webhook
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error("n8n webhook error:", errorText);
      return NextResponse.json(
        { error: "Failed to send email via n8n" },
        { status: 500 }
      );
    }

    // n8n webhook may return empty response or JSON
    let result = null;
    const responseText = await n8nResponse.text();
    if (responseText) {
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        // Response is not JSON, that's okay
        result = { message: responseText };
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Certificate sent successfully",
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send certificate error:", error);
    return NextResponse.json(
      {
        error: "Failed to send certificate",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
