import io
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

class SimpleNumberedCanvas(canvas.Canvas):
    """Dynamically computes total pages and displays clean page footer."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_footer(num_pages)
            super().showPage()
        super().save()

    def draw_footer(self, total_pages):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#475569"))

        # Running Header (pages 2+)
        if self._pageNumber > 1:
            self.drawString(36, 11 * inch - 26, "BuildMyWebsiteAI  •  BEGINNER DEPLOYMENT GUIDE")
            self.setFont("Helvetica", 8)
            self.drawRightString(8.5 * inch - 36, 11 * inch - 26, "100% Free Hosting (Zero Coding Needed)")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.6)
            self.line(36, 11 * inch - 30, 8.5 * inch - 36, 11 * inch - 30)

        # Running Footer
        page_str = f"Page {self._pageNumber} of {total_pages}"
        self.setFont("Helvetica", 8)
        self.drawString(36, 22, "BuildMyWebsiteAI  •  Free Deployment Guide for Vercel & Render")
        self.setFont("Helvetica-Bold", 8)
        self.drawRightString(8.5 * inch - 36, 22, page_str)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.6)
        self.line(36, 32, 8.5 * inch - 36, 32)
        self.restoreState()


def build_sop_story(site_title: str = "Your Website"):
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1E3A8A'),
        spaceAfter=3
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#475569'),
        spaceAfter=9
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1E3A8A'),
        spaceBefore=7,
        spaceAfter=5,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=6,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=4
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#0F172A')
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.5,
        textColor=colors.HexColor('#0F172A')
    )

    step_badge_style = ParagraphStyle(
        'StepBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        alignment=1, # Center
        textColor=colors.HexColor('#1E3A8A')
    )

    story = []

    # =============================================================
    # PAGE 1: WELCOME, PACKAGE CONTENTS, STEP 0, & VERCEL DEPLOYMENT
    # =============================================================
    story.append(Paragraph("BuildMyWebsiteAI • Beginner Deployment Guide", title_style))
    story.append(Paragraph("How to Put Your Website Online for <b>FREE</b> in 2 Minutes (Zero Coding or Technical Skills Needed!)", subtitle_style))

    # Top Welcome Callout
    welcome_box = [
        [
            Paragraph(
                f"<b>Congratulations on creating {site_title}!</b><br/>"
                "You don't need any coding skills, servers, or credit cards to launch your website online. "
                "This easy guide walks you through putting your website on the internet completely <b>FREE</b> so you can share your live link with anyone.",
                callout_style
            )
        ]
    ]
    wt = Table(welcome_box, colWidths=[540])
    wt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#EFF6FF')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#3B82F6')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(wt)
    story.append(Spacer(1, 7))

    # 1. What's Inside Your ZIP File
    story.append(Paragraph("1. What's Inside Your Downloaded ZIP File?", h1_style))
    file_items = [
        [Paragraph("File Name", table_header_style), Paragraph("What It Does", table_header_style), Paragraph("Quick Tip for You", table_header_style)],
        [
            Paragraph("<b>index.html</b>", table_cell_style),
            Paragraph("Your main homepage. Contains all your sections, content, and interactive booking modal.", table_cell_style),
            Paragraph("<b>Instant Preview:</b> Double-click this file right now on your computer to view your website in Chrome/Edge without internet!", table_cell_style)
        ],
        [
            Paragraph("<b>style.css</b>", table_cell_style),
            Paragraph("The design system, custom colors, fonts, and responsive layout for mobile and desktop.", table_cell_style),
            Paragraph("Works automatically with your HTML pages. No need to touch or edit.", table_cell_style)
        ],
        [
            Paragraph("<b>Additional Pages</b><br/>(e.g. <i>about_us.html</i>, <i>services.html</i>)", table_cell_style),
            Paragraph("If you selected a multi-page website, all subpages and custom pages are included here.", table_cell_style),
            Paragraph("Every page includes full navigation links back to Home and other pages.", table_cell_style)
        ],
        [
            Paragraph("<b>Deployment SOP PDF</b>", table_cell_style),
            Paragraph("This beginner-friendly guide so you can re-deploy or reference anytime.", table_cell_style),
            Paragraph("Keep safe on your computer for future reference.", table_cell_style)
        ]
    ]
    ft = Table(file_items, colWidths=[115, 245, 180])
    ft.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(ft)
    story.append(Spacer(1, 6))

    # Mandatory Unzip Box
    unzip_box = [
        [
            Paragraph(
                "<b>STEP 0 (FIRST STEP): UNZIP YOUR FOLDER</b><br/>"
                "• <b>On Windows:</b> Right-click your downloaded ZIP file ➔ Click <b>'Extract All...'</b> ➔ Click <b>'Extract'</b>.<br/>"
                "• <b>On Mac:</b> Double-click your downloaded ZIP file.<br/>"
                "<i>Now you have an unzipped normal folder containing <code>index.html</code> and <code>style.css</code> ready to upload!</i>",
                callout_style
            )
        ]
    ]
    ut = Table(unzip_box, colWidths=[540])
    ut.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FEF3C7')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#F59E0B')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(ut)
    story.append(Spacer(1, 8))

    # 2. Vercel Deployment
    story.append(Paragraph("2. Deploy on Vercel (EASIEST & RECOMMENDED — 100% Free, 1 Minute)", h1_style))
    story.append(Paragraph(
        "Vercel is the fastest way to get your website online. Just <b>drag and drop</b> your unzipped folder into your browser. "
        "No coding, no terminal, and no Git required!",
        body_style
    ))

    vercel_steps = [
        [Paragraph("Step", table_header_style), Paragraph("Simple Action to Take", table_header_style), Paragraph("Helpful Detail", table_header_style)],
        [
            Paragraph("<b>Step 1</b>", step_badge_style),
            Paragraph("Open your web browser and go to <b>https://vercel.com</b>.<br/>Click <b>'Sign Up'</b> (free with Google or GitHub).", table_cell_style),
            Paragraph("100% free account with zero credit card required.", table_cell_style)
        ],
        [
            Paragraph("<b>Step 2</b>", step_badge_style),
            Paragraph("From your Vercel Dashboard, click the blue <b>'Add New...'</b> button (top right) ➔ Select <b>'Project'</b>.", table_cell_style),
            Paragraph("Opens the quick import project screen.", table_cell_style)
        ],
        [
            Paragraph("<b>Step 3</b>", step_badge_style),
            Paragraph("<b>Drag & Drop:</b> Grab your <b>unzipped website folder</b> from your computer and drop it directly onto the upload box on the screen.<br/><i>(Or go to vercel.com/new and drag your folder there)</i>", table_cell_style),
            Paragraph("Vercel instantly receives all your HTML and CSS files.", table_cell_style)
        ],
        [
            Paragraph("<b>Step 4</b>", step_badge_style),
            Paragraph("<b>Quick Settings:</b><br/>"
                      "• <b>Project Name:</b> Enter your website name (e.g. <code>my-business-site</code>)<br/>"
                      "• <b>Framework Preset:</b> Choose <b>'Other'</b><br/>"
                      "• <b>Root Directory:</b> Leave default (<code>./</code>)<br/>"
                      "• <b>Build Command:</b> Leave <b>BLANK</b> (pure static HTML needs no build step)", table_cell_style),
            Paragraph("Takes less than 10 seconds to verify.", table_cell_style)
        ],
        [
            Paragraph("<b>Step 5</b>", step_badge_style),
            Paragraph("Click the black <b>'Deploy'</b> button.<br/>"
                      "Within 15 seconds, confetti appears on your screen and your site is <b>LIVE</b>!", table_cell_style),
            Paragraph("You get a free secure link:<br/><b>https://your-site.vercel.app</b>", table_cell_style)
        ]
    ]
    vt = Table(vercel_steps, colWidths=[45, 330, 165])
    vt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(vt)

    # =============================================================
    # PAGE 2: DEPLOYING TO RENDER (SIMPLE WEB WORKFLOW - NO TERMINAL)
    # =============================================================
    story.append(PageBreak())

    story.append(Paragraph("3. Deploy on Render (100% Free Cloud Hosting)", h1_style))
    story.append(Paragraph(
        "Render is another popular free cloud platform that hosts your static website forever with zero server maintenance. "
        "You can deploy it directly via the GitHub website using simple point-and-click upload — <b>no terminal commands or coding needed!</b>",
        body_style
    ))

    story.append(Paragraph("Part A: Upload Your Files to GitHub (Using Browser Drag & Drop)", h2_style))
    github_steps = [
        [Paragraph("Step", table_header_style), Paragraph("Browser Action", table_header_style), Paragraph("Notes", table_header_style)],
        [
            Paragraph("<b>A.1</b>", step_badge_style),
            Paragraph("Go to <b>https://github.com</b> and create a free account (or log in).", table_cell_style),
            Paragraph("GitHub securely holds your website files in the cloud.", table_cell_style)
        ],
        [
            Paragraph("<b>A.2</b>", step_badge_style),
            Paragraph("Click the <b>'+'</b> icon at the top right corner ➔ Click <b>'New repository'</b>.", table_cell_style),
            Paragraph("Opens the repository creation page.", table_cell_style)
        ],
        [
            Paragraph("<b>A.3</b>", step_badge_style),
            Paragraph("Type a <b>Repository name</b> (e.g. <code>my-website</code>). Keep it <b>Public</b>. Click the green <b>'Create repository'</b> button.", table_cell_style),
            Paragraph("Do not check README or .gitignore.", table_cell_style)
        ],
        [
            Paragraph("<b>A.4</b>", step_badge_style),
            Paragraph("On the next screen, click the text link that says <b>'uploading an existing file'</b>.<br/>"
                      "Select all files from your unzipped folder (<code>index.html</code>, <code>style.css</code>, etc.) and drag them into the browser box.", table_cell_style),
            Paragraph("All files will upload into GitHub in a few seconds.", table_cell_style)
        ],
        [
            Paragraph("<b>A.5</b>", step_badge_style),
            Paragraph("Scroll to the bottom of the page and click the green <b>'Commit changes'</b> button.<br/>Your files are now safely uploaded!", table_cell_style),
            Paragraph("Your website files are ready for Render.", table_cell_style)
        ]
    ]
    gt = Table(github_steps, colWidths=[40, 345, 155])
    gt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(gt)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Part B: Connect Your Repository to Render (1-Click Launch)", h2_style))
    render_steps = [
        [Paragraph("Step", table_header_style), Paragraph("Render Configuration Action", table_header_style), Paragraph("Exact Setting Needed", table_header_style)],
        [
            Paragraph("<b>B.1</b>", step_badge_style),
            Paragraph("Go to <b>https://dashboard.render.com</b> and sign in using your GitHub account.", table_cell_style),
            Paragraph("Free lifetime static site account.", table_cell_style)
        ],
        [
            Paragraph("<b>B.2</b>", step_badge_style),
            Paragraph("Click the blue <b>'New +'</b> button (top right) ➔ Select <b>'Static Site'</b>.", table_cell_style),
            Paragraph("<b>Important:</b> Select 'Static Site' (not Web Service).", table_cell_style)
        ],
        [
            Paragraph("<b>B.3</b>", step_badge_style),
            Paragraph("Find your repository (e.g. <code>my-website</code>) in the list and click <b>'Connect'</b>.", table_cell_style),
            Paragraph("Links your code to Render's CDN.", table_cell_style)
        ],
        [
            Paragraph("<b>B.4</b>", step_badge_style),
            Paragraph("<b>Fill in 3 simple fields:</b><br/>"
                      "• <b>Name:</b> Enter your website name (e.g. <code>my-business-site</code>)<br/>"
                      "• <b>Branch:</b> <code>main</code><br/>"
                      "• <b>Build Command:</b> Leave <b>COMPLETELY BLANK</b><br/>"
                      "• <b>Publish Directory:</b> Type a single dot <code>.</code> (period)", table_cell_style),
            Paragraph("<b>Key Setting:</b> Setting Publish Directory to <code>.</code> tells Render your <code>index.html</code> is in the main folder.", table_cell_style)
        ],
        [
            Paragraph("<b>B.5</b>", step_badge_style),
            Paragraph("Click the blue <b>'Create Static Site'</b> button.<br/>"
                      "In ~45 seconds, your website is online with free SSL protection!", table_cell_style),
            Paragraph("Live URL:<br/><b>https://your-site.onrender.com</b>", table_cell_style)
        ]
    ]
    rt = Table(render_steps, colWidths=[40, 320, 180])
    rt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#065F46')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(rt)
    story.append(Spacer(1, 8))

    render_callout = [
        [
            Paragraph(
                "<b>WHICH SHOULD YOU CHOOSE? VERCEL OR RENDER?</b><br/>"
                "• <b>Choose Vercel</b> if you want the absolute easiest 60-second method: drag your unzipped folder straight into the browser.<br/>"
                "• <b>Choose Render</b> if you prefer keeping a backup copy of your website files on GitHub.<br/>"
                "<i>Both platforms are 100% free forever, super fast, and give you a secure https link!</i>",
                callout_style
            )
        ]
    ]
    rc = Table(render_callout, colWidths=[540])
    rc.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#ECFDF5')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#10B981')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(rc)

    # =============================================================
    # PAGE 3: CUSTOM DOMAINS, HOW TO TEST, & BEGINNER FAQ
    # =============================================================
    story.append(PageBreak())

    # 4. Custom Domains
    story.append(Paragraph("4. Want Your Own Custom Domain? (e.g. www.MyBrand.com)", h1_style))
    story.append(Paragraph(
        "If you already bought or want to buy your own custom domain (from GoDaddy, Hostinger, Namecheap, Google Domains, etc.), "
        "both Vercel and Render allow you to connect it <b>100% free</b> with automated SSL (green padlock security):",
        body_style
    ))

    domain_box = [
        [
            Paragraph(
                "<b>HOW TO CONNECT YOUR CUSTOM DOMAIN:</b><br/>"
                "• <b>On Vercel:</b> Open your project ➔ Click <b>'Settings'</b> ➔ Click <b>'Domains'</b> ➔ Enter your domain (e.g. <code>mybrand.com</code>) ➔ Vercel will show simple DNS settings to copy into your domain provider.<br/>"
                "• <b>On Render:</b> Open your static site ➔ Click <b>'Settings'</b> ➔ Click <b>'Custom Domains'</b> ➔ Add your domain name ➔ Add the simple CNAME record provided.<br/>"
                "<i>Within a few minutes, your website will open at your own professional custom web address!</i>",
                callout_style
            )
        ]
    ]
    dt = Table(domain_box, colWidths=[540])
    dt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FEF3C7')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#F59E0B')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(dt)
    story.append(Spacer(1, 8))

    # 5. Testing Your Live Website
    story.append(Paragraph("5. Testing Your Live Website (Quick Checklist)", h1_style))
    story.append(Paragraph(
        "Once your website is deployed, test these 4 quick features to make sure everything looks great:",
        body_style
    ))

    test_box = [
        [
            Paragraph(
                "<b>1. Test On Your Mobile Phone:</b> Send your new live URL to your phone via WhatsApp or email. Notice how your site automatically adapts to mobile screens with a touch menu!<br/>"
                "<b>2. Click All Page Links:</b> If you built a multi-page site (About Us, Services, Contact, etc.), click the links in your navbar to ensure smooth navigation.<br/>"
                "<b>3. Try the Interactive Booking Button:</b> Click 'Book Appointment' or 'Get Started'. An interactive popup appears directly on screen so your visitors can schedule appointments.<br/>"
                "<b>4. Try Entering a Phone Number:</b> Notice the built-in phone number validator (+91 country code) prevents visitors from accidentally submitting invalid contact numbers.",
                callout_style
            )
        ]
    ]
    tt = Table(test_box, colWidths=[540])
    tt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#94A3B8')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(tt)
    story.append(Spacer(1, 8))

    # 6. Beginner FAQ
    story.append(Paragraph("6. Frequently Asked Questions (FAQ) for Beginners", h1_style))
    faq_items = [
        [Paragraph("Common Question", table_header_style), Paragraph("Simple Answer", table_header_style)],
        [
            Paragraph("<b>Does this cost any money?</b>", table_cell_style),
            Paragraph("<b>No! 100% Free.</b> Both Vercel and Render offer free tiers that have no expiration date and easily handle everyday business visitors.", table_cell_style)
        ],
        [
            Paragraph("<b>Do I need to keep my computer turned on?</b>", table_cell_style),
            Paragraph("<b>No.</b> Your website is stored on high-speed global cloud servers that operate 24 hours a day, 7 days a week, worldwide.", table_cell_style)
        ],
        [
            Paragraph("<b>Can I change the text or images later?</b>", table_cell_style),
            Paragraph("<b>Yes!</b> You can go back into BuildMyWebsiteAI Studio to adjust content and download an updated ZIP, or open <code>index.html</code> in Notepad to change wording.", table_cell_style)
        ],
        [
            Paragraph("<b>Where can I share my new website link?</b>", table_cell_style),
            Paragraph("You can put your link on WhatsApp status, Instagram bio, Google Business Profile, business cards, Facebook, or send via email to clients.", table_cell_style)
        ]
    ]
    faqt = Table(faq_items, colWidths=[180, 360])
    faqt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(faqt)
    story.append(Spacer(1, 9))

    # Footer signature banner
    banner_box = [
        [
            Paragraph(
                "<b>Need help or want to create another website?</b><br/>"
                "Visit <b>BuildMyWebsiteAI</b> anytime to generate modern, responsive, multi-page business websites with instant AI prompt generation and zero coding required!",
                callout_style
            )
        ]
    ]
    bt = Table(banner_box, colWidths=[540])
    bt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#EFF6FF')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#60A5FA')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(bt)

    return story


def generate_deployment_guide_pdf_bytes(site_title: str = "Your Website") -> bytes:
    """
    Generates a simple, beginner-friendly deployment guide PDF buffer
    designed specifically for non-technical users (no terminal or coding needed).
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    story = build_sop_story(site_title)
    doc.build(story, canvasmaker=SimpleNumberedCanvas)
    buffer.seek(0)
    return buffer.getvalue()


if __name__ == "__main__":
    pdf_bytes = generate_deployment_guide_pdf_bytes("BuildMyWebsiteAI Website")
    out_file = os.path.abspath("BuildMyWebsiteAI_Static_Website_Deployment_SOP.pdf")
    with open(out_file, "wb") as f:
        f.write(pdf_bytes)
    print(f"Successfully generated {out_file} ({len(pdf_bytes)} bytes)")
