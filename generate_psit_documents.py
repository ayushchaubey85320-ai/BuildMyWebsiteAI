import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class PSITCanvas(canvas.Canvas):
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
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        if self._pageNumber > 1:
            self.saveState()
            # PSIT Header Banner Text
            self.setFont("Times-Bold", 8)
            self.setFillColor(colors.HexColor("#991b1b")) # PSIT Red
            self.drawString(54, 842 - 36, "PRANVEER SINGH INSTITUTE OF TECHNOLOGY, KANPUR")
            self.setFont("Times-Roman", 8)
            self.setFillColor(colors.HexColor("#475569"))
            self.drawRightString(595 - 54, 842 - 36, "Department of Computer Applications • FYP 2026-27")
            
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 842 - 42, 595 - 54, 842 - 42)

            # Footer Page Numbering
            self.line(54, 46, 595 - 54, 46)
            self.setFont("Times-Roman", 9)
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawCentredString(595 / 2.0, 32, page_text)
            self.drawString(54, 32, "Subject Code: CA-353 (Mini Project)")
            self.drawRightString(595 - 54, 32, "PSIT Kanpur / AKTU Lucknow")
            self.restoreState()

def create_psit_synopsis():
    pdf_path = os.path.abspath("BuildMyWebsiteAI_PSIT_Synopsis.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    h1_style = ParagraphStyle(
        'PSITH1', parent=styles['Normal'],
        fontName='Times-Bold', fontSize=14, leading=20,
        alignment=TA_LEFT, textColor=colors.HexColor("#0f172a"),
        spaceBefore=14, spaceAfter=8, keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'PSITH2', parent=styles['Normal'],
        fontName='Times-Bold', fontSize=12, leading=18,
        alignment=TA_LEFT, textColor=colors.HexColor("#1e293b"),
        spaceBefore=10, spaceAfter=6, keepWithNext=True
    )

    body_style = ParagraphStyle(
        'PSITBody', parent=styles['Normal'],
        fontName='Times-Roman', fontSize=12, leading=18,
        alignment=TA_JUSTIFY, textColor=colors.HexColor("#1e293b"),
        spaceAfter=8, firstLineIndent=18
    )

    body_bullet = ParagraphStyle(
        'PSITBullet', parent=styles['Normal'],
        fontName='Times-Roman', fontSize=12, leading=18,
        alignment=TA_JUSTIFY, textColor=colors.HexColor("#1e293b"),
        spaceAfter=4, leftIndent=20
    )

    center_bold = ParagraphStyle(
        'PSITCenterBold', parent=styles['Normal'],
        fontName='Times-Bold', fontSize=14, leading=20,
        alignment=TA_CENTER, textColor=colors.HexColor("#0f172a")
    )

    story = []

    # =========================================================================
    # 1. PSIT / AKTU OFFICIAL FRONT PAGE
    # =========================================================================
    story.append(Paragraph("<b>A Synopsis</b>", ParagraphStyle('PST1', parent=center_bold, fontSize=16, leading=22)))
    story.append(Paragraph("On", ParagraphStyle('PST2', parent=center_bold, fontName='Times-Italic', fontSize=14, leading=20, spaceBefore=2)))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>BuildMyWebsiteAI</b>", ParagraphStyle('PST3', parent=center_bold, fontSize=22, leading=28, textColor=colors.HexColor("#991b1b"))))
    story.append(Paragraph("An Autonomous AI-Powered Multi-Page Web Application Generator Platform with Dynamic Theme Engine & Real-Time Gemini AI Chatbot Assistant", ParagraphStyle('PST4', parent=center_bold, fontName='Times-Italic', fontSize=11, leading=16, textColor=colors.HexColor("#475569"), spaceBefore=4)))
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("<i>of</i>", ParagraphStyle('PST5', parent=center_bold, fontName='Times-Italic', fontSize=12)))
    story.append(Paragraph("<b>Mini PROJECT (CA-353)</b>", ParagraphStyle('PST6', parent=center_bold, fontSize=13, leading=18, spaceBefore=2)))
    story.append(Paragraph("<b>MCA-II Year / III Semester</b>", ParagraphStyle('PST7', parent=center_bold, fontSize=12, leading=16, spaceBefore=2)))
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("Submitted to the Department of Computer Application by:", ParagraphStyle('PST8', parent=center_bold, fontName='Times-Roman', fontSize=11)))
    
    team_table_data = [
        [Paragraph("<b>1. Ayush Chaubey</b> (Team Leader)", body_style), Paragraph("Roll No: <b>2501640140028</b>", body_style)],
        [Paragraph("<b>2. Dev Tripathi</b> (Team Member)", body_style), Paragraph("Roll No: <b>2501640140038</b>", body_style)],
        [Paragraph("<b>3. Ritesh Mishra</b> (Team Member)", body_style), Paragraph("Roll No: <b>2501640140083</b>", body_style)],
        [Paragraph("<b>4. Ayush Tiwari</b> (Team Member)", body_style), Paragraph("Roll No: <b>2501640140031</b>", body_style)],
        [Paragraph("<b>5. Yashraj Dixit</b> (Team Member)", body_style), Paragraph("Roll No: <b>2501640140113</b>", body_style)],
    ]
    t_team = Table(team_table_data, colWidths=[240, 200])
    t_team.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(t_team)
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("Under the Supervision of:", ParagraphStyle('PST10', parent=center_bold, fontName='Times-Roman', fontSize=11)))
    story.append(Paragraph("<b>Dr. Narendra Kumar Sharma</b><br/>(Designation, Department of Computer Application)", ParagraphStyle('PST11', parent=center_bold, fontSize=12, leading=17, spaceBefore=2)))
    
    story.append(Spacer(1, 14))
    story.append(Paragraph("<b>PRANVEER SINGH INSTITUTE OF TECHNOLOGY, KANPUR</b>", ParagraphStyle('PST12', parent=center_bold, fontSize=13, leading=18, textColor=colors.HexColor("#991b1b"))))
    story.append(Paragraph("Approved by AICTE and Affiliated to", ParagraphStyle('PST13', parent=center_bold, fontName='Times-Italic', fontSize=10, spaceBefore=2)))
    story.append(Paragraph("<b>Dr. A.P.J. ABDUL KALAM TECHNICAL UNIVERSITY, LUCKNOW</b>", ParagraphStyle('PST14', parent=center_bold, fontSize=12, leading=17, spaceBefore=2, textColor=colors.HexColor("#0f172a"))))
    story.append(Paragraph("<b>Academic Session 2026–2027</b>", ParagraphStyle('PST15', parent=center_bold, fontSize=11, leading=15, spaceBefore=4)))
    story.append(PageBreak())

    # =========================================================================
    # 2. TABLE OF CONTENT
    # =========================================================================
    story.append(Paragraph("<b>2. TABLE OF CONTENT</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=12))
    
    toc_data = [
        [Paragraph("<b>S.No.</b>", h2_style), Paragraph("<b>Topic / Section Title</b>", h2_style), Paragraph("<b>Page No.</b>", h2_style)],
        [Paragraph("1.", body_style), Paragraph("Front Page & Team Metadata", body_style), Paragraph("1", body_style)],
        [Paragraph("2.", body_style), Paragraph("Table of Content", body_style), Paragraph("2", body_style)],
        [Paragraph("3.", body_style), Paragraph("Certificate & Declaration", body_style), Paragraph("3", body_style)],
        [Paragraph("4.", body_style), Paragraph("INTRODUCTION", body_style), Paragraph("4", body_style)],
        [Paragraph("5.", body_style), Paragraph("Gap in Study", body_style), Paragraph("5", body_style)],
        [Paragraph("6.", body_style), Paragraph("Proposed System Architecture", body_style), Paragraph("6", body_style)],
        [Paragraph("7.", body_style), Paragraph("MINI PROJECT SCOPE", body_style), Paragraph("7", body_style)],
        [Paragraph("8.", body_style), Paragraph("AIMS AND OBJECTIVE", body_style), Paragraph("8", body_style)],
        [Paragraph("9.", body_style), Paragraph("Brief Modules Description", body_style), Paragraph("9", body_style)],
        [Paragraph("10.", body_style), Paragraph("Tools and Technology Used", body_style), Paragraph("10", body_style)],
        [Paragraph("11.", body_style), Paragraph("System Requirement (Hardware & Software)", body_style), Paragraph("11", body_style)],
        [Paragraph("12.", body_style), Paragraph("METHODOLOGY (Frontend, Backend, DFD & ERD)", body_style), Paragraph("12", body_style)],
        [Paragraph("13.", body_style), Paragraph("EXPECTED TIME SCHEDULE (Gantt Chart)", body_style), Paragraph("13", body_style)],
        [Paragraph("14.", body_style), Paragraph("IMPACT OF PROPOSED SYSTEM IN ACADEMICS & INDUSTRY", body_style), Paragraph("13", body_style)],
        [Paragraph("15.", body_style), Paragraph("ROLES AND RESPONSIBILITY", body_style), Paragraph("14", body_style)],
        [Paragraph("16.", body_style), Paragraph("PROS AND CONS", body_style), Paragraph("14", body_style)],
        [Paragraph("17.", body_style), Paragraph("CONCLUSION AND FUTURE SCOPE", body_style), Paragraph("15", body_style)],
        [Paragraph("18.", body_style), Paragraph("REFERENCES", body_style), Paragraph("15", body_style)],
    ]
    t_toc = Table(toc_data, colWidths=[40, 370, 77])
    t_toc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_toc)
    story.append(PageBreak())

    # =========================================================================
    # 3. PSIT CERTIFICATE & DECLARATION
    # =========================================================================
    story.append(Paragraph("<b>3. DECLARATION & CERTIFICATE</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=14))
    
    story.append(Paragraph("<b>DECLARATION</b>", h2_style))
    decl_text = (
        "We hereby declare that the Mini Project Synopsis entitled <b>\"BuildMyWebsiteAI: An Autonomous AI-Powered Multi-Page Web Application Generator Platform\"</b> "
        "submitted in partial fulfillment of the requirements for the award of the degree of <b>Master of Computer Application (MCA)</b> to "
        "<b>Pranveer Singh Institute of Technology, Kanpur</b> affiliated to <b>Dr. A.P.J. Abdul Kalam Technical University, Lucknow</b> "
        "comprises authentic research work carried out by us under guidance. Due acknowledgement has been made in the text to all other materials used."
    )
    story.append(Paragraph(decl_text, body_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>CERTIFICATE</b>", h2_style))
    cert_text = (
        "This is to certify that Report entitled <b>\"BuildMyWebsiteAI\"</b> which is submitted by "
        "<b>Ayush Chaubey (Roll No: 2501640140028), Dev Tripathi (Roll No: 2501640140038), Ritesh Mishra (Roll No: 2501640140083), "
        "Ayush Tiwari (Roll No: 2501640140031), and Yashraj Dixit (Roll No: 2501640140113)</b> "
        "in partial fulfillment of the requirement for the award of degree Master of Computer Application to Pranveer Singh Institute of Technology, Kanpur "
        "Dr. A P J A K Technical University, Lucknow is a record of the candidates own work carried out by them under my supervision. "
        "The matter embodied in this thesis is original and has not been submitted for the award of any other degree."
    )
    story.append(Paragraph(cert_text, body_style))
    story.append(Spacer(1, 40))
    
    cert_sig = [
        [Paragraph("Date: ______________", body_style), Paragraph("Signature: ______________________<br/><b>Dr. Narendra Kumar Sharma</b><br/>(Supervisor, Department of MCA)", body_style)],
        [Paragraph("<br/><br/>Approved By: ______________________<br/><b>Head of Department (HOD)</b>", body_style),
         Paragraph("<br/><br/>Official Stamp / Seal:<br/><b>PSIT Kanpur</b>", body_style)]
    ]
    t_sig = Table(cert_sig, colWidths=[240, 247])
    t_sig.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 16),
    ]))
    story.append(t_sig)
    story.append(PageBreak())

    # =========================================================================
    # 4. INTRODUCTION
    # =========================================================================
    story.append(Paragraph("<b>4. INTRODUCTION</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=10))
    
    intro_p1 = (
        "In the contemporary digital era, establishing a high-performance web presence is vital for businesses, startups, educational institutions, "
        "and professionals. However, traditional website development involves lengthy software development life cycles (SDLC), requiring hand-coded "
        "HTML/CSS/JS frameworks, responsive breakpoints, server configurations, and database integrations. While low-code/no-code platforms like Wix, "
        "Squarespace, and WordPress simplified website building, they suffer from steep learning curves, rigid design templates, heavy code bloat, and subscription lock-in."
    )
    story.append(Paragraph(intro_p1, body_style))
    
    intro_p2 = (
        "<b>BuildMyWebsiteAI</b> bridges this gap by pioneering an autonomous artificial intelligence platform that generates production-grade, "
        "fully responsive multi-page web applications directly from natural language prompts. Operating on a modern decoupled architecture powered by "
        "<b>React 18, Vite, TailwindCSS, FastAPI, SQLAlchemy, MySQL, and Google Gemini 3.5 AI</b>, BuildMyWebsiteAI constructs multi-page page tree structures, "
        "curates semantic typography and palette tokens, renders interactive section layouts with AOS scroll animations, and provides 1-click HTML/CSS ZIP bundle exports."
    )
    story.append(Paragraph(intro_p2, body_style))

    intro_p3 = (
        "Furthermore, the platform incorporates a <b>Global Dark 🌙 / Light ☀️ Theme Engine</b>, seamless user authentication with JWT security, "
        "an interactive <b>Super Admin Control Portal</b>, and a dedicated <b>Floating AI Chatbot Assistant</b> connected live to the Google Gemini 3.5 Flash engine "
        "capable of dynamically answering any technical or design query in real time."
    )
    story.append(Paragraph(intro_p3, body_style))

    # =========================================================================
    # 5. GAP IN STUDY
    # =========================================================================
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>5. GAP IN STUDY</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=10))
    
    gaps = [
        "<b>Single-Page Limitations vs Multi-Page Demands:</b> Most existing AI site generators create only a single landing page, failing to structure authentic multi-page websites (`Home`, `About Us`, `Services`, `Showcase`, `Pricing`, `Contact Us`).",
        "<b>Code Bloat & Proprietary Lock-In:</b> Traditional drag-and-drop website builders produce convoluted, unoptimized code output that cannot be easily exported or self-hosted independently.",
        "<b>Static Theme Constraints:</b> Existing AI tools lack unified, global surface-color synchronization when toggling between Dark and Light mode across all dashboard cards, user tables, and canvas views.",
        "<b>Absence of Embedded AI Mentorship:</b> Web builders lack an integrated, real-time AI Assistant capable of providing prompt engineering advice, category guidance, and platform answers directly within the workspace.",
        "<b>Deployment & Export Barriers:</b> Platforms obscure generated code files behind paywalls instead of providing 1-click clean HTML/CSS/JS ZIP archive downloads and co-domain network publishing."
    ]
    for g in gaps:
        story.append(Paragraph(f"• {g}", body_bullet))

    story.append(PageBreak())

    # =========================================================================
    # 6. PROPOSED SYSTEM
    # =========================================================================
    story.append(Paragraph("<b>6. PROPOSED SYSTEM</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=10))
    
    prop_features = [
        "<b>Autonomous Page Tree Generator:</b> Converts natural language user prompts into detailed JSON Page Tree schemas containing structured section properties for 18 industry verticals (AI Startup, SaaS, E-Commerce, Healthcare, Real Estate, Restaurant, etc.).",
        "<b>Dedicated Multi-Page Router:</b> Implements full client-side SPA routing (`/`, `/features`, `/showcase`, `/how-it-works`, `/pricing`, `/faq`, `/dashboard`, `/admin`) backed by static Render fallback rewrite rules (`/* /index.html 200`).",
        "<b>Universal Dark 🌙 / Light ☀️ Theme Engine:</b> Features a single circular theme toggle in the top navbar that dynamically updates CSS variable tokens, surface cards, metrics panels, and HTML5 Canvas particle background shaders globally.",
        "<b>Interactive Mouse Laser Particle Background:</b> An HTML5 Canvas rendering engine featuring particle magnetic attraction physics, energy laser connection beams, and cursor trail motion ripples across 100% of pages.",
        "<b>Real-Time Gemini 3.5 AI Chatbot Assistant:</b> A floating global AI assistant widget powered by Google Gemini 3.5 REST API capable of answering any technical, design, or prompting query live.",
        "<b>Robust Export & Deployment Engine:</b> Generates standard W3C-compliant standalone HTML5/CSS3 ZIP archives equipped with AOS scroll animation CDN scripts and instant 1-click co-domain network publishing."
    ]
    for p in prop_features:
        story.append(Paragraph(f"• {p}", body_bullet))

    # =========================================================================
    # 7. MINI PROJECT SCOPE
    # =========================================================================
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>7. MINI PROJECT SCOPE</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=10))
    
    scopes = [
        "<b>Functional Scope:</b> Covers user registration, OTP email verification, JWT authentication, 18 category website generation, multi-page routing, live desktop/tablet/mobile viewport canvas preview, 1-click ZIP export, co-domain deployment, and super admin management.",
        "<b>Non-Functional Scope:</b> Guarantees sub-second API response times, 100% viewport responsiveness across all device form factors, HTTPS SSL data encryption, and resilient JSON deserialization (`safe_dict`).",
        "<b>Target Audience:</b> Small business owners, tech startups, freelancers, digital agencies, students, and non-technical entrepreneurs seeking instant professional websites."
    ]
    for s in scopes:
        story.append(Paragraph(f"• {s}", body_bullet))

    # =========================================================================
    # 8. AIMS AND OBJECTIVE
    # =========================================================================
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>8. AIMS AND OBJECTIVE</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=10))
    
    aims = [
        "<b>Primary Aim:</b> To engineer an autonomous AI-driven platform that reduces web development time from days to under 10 seconds while maintaining professional aesthetic quality.",
        "<b>Objective 1:</b> Implement Google Gemini 3.5 AI REST API integration for dynamic text content generation and conversational chatbot mentorship.",
        "<b>Objective 2:</b> Build a responsive client-side SPA architecture using React 18, Framer Motion, and TailwindCSS with zero layout distortion.",
        "<b>Objective 3:</b> Construct a secure RESTful API backend using FastAPI, Pydantic, SQLAlchemy, and MySQL hosted on Aiven Cloud.",
        "<b>Objective 4:</b> Ensure 100% self-contained code output through downloadable ZIP archives containing clean HTML, CSS, and JS files."
    ]
    for a in aims:
        story.append(Paragraph(f"• {a}", body_bullet))

    story.append(PageBreak())

    # =========================================================================
    # 9. BRIEF MODULES DESCRIPTION
    # =========================================================================
    story.append(Paragraph("<b>9. BRIEF MODULES DESCRIPTION</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=10))
    
    modules = [
        ("Authentication & Access Control Module", "Manages user registration, bcrypt password hashing, OTP verification via SMTP Gmail, JWT bearer token generation, and role-based access control (User vs Super Admin)."),
        ("AI Prompt & Page Tree Generation Module", "Interprets natural language prompts, selects optimal category design tokens (colors, typography, hero media), and constructs structured multi-page JSON page tree trees."),
        ("Canvas Preview & Multi-Page Router Module", "Renders live web layouts inside desktop, tablet (768px), and mobile (375px) viewports with real-time sub-page navigation (`Home`, `About Us`, `Services`, `Contact Us`)."),
        ("Export & Deployment Engine Module", "Converts database page tree schemas into W3C-compliant standalone HTML5 files and CSS stylesheet bundles, packaging them into downloadable ZIP archives."),
        ("Super Admin Portal Module", "Provides platform-wide metrics overview (total users, active projects, live co-domains), user management table, password reset capabilities, and 1-click user session impersonation."),
        ("Google Gemini 3.5 AI Chatbot Module", "A global floating widget connected directly to Google Gemini 3.5 REST API models (`gemini-3.5-flash`), featuring conversation history memory and custom API key override settings.")
    ]
    for title, desc in modules:
        story.append(Paragraph(f"<b>• {title}:</b> {desc}", body_style))

    # =========================================================================
    # 10. TOOLS AND TECHNOLOGY USED
    # =========================================================================
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>10. TOOLS AND TECHNOLOGY USED</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=10))
    
    tech_data = [
        [Paragraph("<b>Layer / Category</b>", h2_style), Paragraph("<b>Technology / Framework</b>", h2_style), Paragraph("<b>Purpose & Role</b>", h2_style)],
        [Paragraph("Frontend Core", body_style), Paragraph("React 18, Vite, JavaScript (ES6+)", body_style), Paragraph("High-performance SPA rendering & fast build pipeline", body_style)],
        [Paragraph("Styling & UI", body_style), Paragraph("TailwindCSS, Vanilla CSS, Lucide Icons", body_style), Paragraph("Utility-first styling, glassmorphism, responsive layout", body_style)],
        [Paragraph("Animations", body_style), Paragraph("Framer Motion, HTML5 Canvas API", body_style), Paragraph("Interactive particle laser physics & dynamic transitions", body_style)],
        [Paragraph("Backend Core", body_style), Paragraph("Python 3.13, FastAPI, Uvicorn", body_style), Paragraph("Asynchronous RESTful API server & request routing", body_style)],
        [Paragraph("Database & ORM", body_style), Paragraph("MySQL (Aiven Cloud), SQLAlchemy, PyMySQL", body_style), Paragraph("Relational data storage, ORM models, connection pooling", body_style)],
        [Paragraph("AI Intelligence", body_style), Paragraph("Google Gemini 3.5 Flash REST API", body_style), Paragraph("Natural language page tree generation & live AI Chatbot", body_style)],
        [Paragraph("Security & Mail", body_style), Paragraph("PyJWT, Passlib (Bcrypt), SMTPLib", body_style), Paragraph("JWT token auth, password hashing, OTP verification", body_style)],
        [Paragraph("Deployment", body_style), Paragraph("Render Cloud, GitHub, Git", body_style), Paragraph("Automated CI/CD production hosting & version control", body_style)],
    ]
    t_tech = Table(tech_data, colWidths=[110, 170, 207])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_tech)

    # =========================================================================
    # 11. SYSTEM REQUIREMENT
    # =========================================================================
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>11. SYSTEM REQUIREMENT</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=10))
    
    story.append(Paragraph("<b>11.1 Hardware Requirements:</b>", h2_style))
    hw_reqs = [
        "<b>Processor:</b> Intel Core i3 / AMD Ryzen 3 or higher (Quad-core recommended).",
        "<b>System Memory (RAM):</b> Minimum 4 GB (8 GB recommended for concurrent dev servers).",
        "<b>Storage Space:</b> Minimum 2 GB free disk space (SSD recommended).",
        "<b>Network:</b> Broadband Internet Connection (Minimum 5 Mbps for AI API calls & CDN scripts)."
    ]
    for hw in hw_reqs:
        story.append(Paragraph(f"• {hw}", body_bullet))

    story.append(Paragraph("<b>11.2 Software Requirements:</b>", h2_style))
    sw_reqs = [
        "<b>Operating System:</b> Windows 10/11, macOS 12+, or Ubuntu Linux 20.04+.",
        "<b>Runtime Environment:</b> Node.js v18.0+ & Python 3.10+ (Python 3.13 tested).",
        "<b>Database Server:</b> MySQL 8.0+ (Localhost or Aiven Cloud Database instance).",
        "<b>Web Browser:</b> Google Chrome, Mozilla Firefox, Microsoft Edge, or Apple Safari."
    ]
    for sw in sw_reqs:
        story.append(Paragraph(f"• {sw}", body_bullet))

    story.append(PageBreak())

    # =========================================================================
    # 12. METHODOLOGY
    # =========================================================================
    story.append(Paragraph("<b>12. METHODOLOGY</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=10))
    
    story.append(Paragraph("<b>12.1 Frontend Methodology to Implement Mini Project:</b>", h2_style))
    fe_meth = (
        "The frontend methodology relies on a component-driven Single Page Application (SPA) architecture using React 18 and Vite. "
        "All visual components consume global theme tokens from a central `ThemeContext.jsx`. Page routing is managed by `react-router-dom` "
        "with `_redirects` rewrite rules (`/* /index.html 200`) ensuring seamless client-side page refreshes on static hosts. "
        "An HTML5 Canvas element (`AnimatedBackground.jsx`) tracks cursor coordinates `(mouseX, mouseY)` to calculate particle vector forces, "
        "render energy laser connection beams, and draw glowing mouse trail ripples dynamically."
    )
    story.append(Paragraph(fe_meth, body_style))

    story.append(Paragraph("<b>12.2 Backend Methodology to Implement Mini Project:</b>", h2_style))
    be_meth = (
        "The backend methodology adopts a layered microservices pattern built on FastAPI and SQLAlchemy. Request workflows follow: "
        "Router -> Dependency Interceptor (JWT Verification) -> Controller -> Service Layer -> Database ORM. "
        "To prevent runtime crashes during MySQL data retrieval, the backend implements a `safe_dict` utility that automatically parses "
        "JSON strings and safely handles `NoneType` sections. The export pipeline utilizes Python's `zipfile` and `io.BytesIO` modules "
        "to construct W3C-compliant standalone HTML5 files and CSS stylesheets in-memory before streaming binary blobs to the client."
    )
    story.append(Paragraph(be_meth, body_style))

    story.append(Paragraph("<b>12.3 System Design (Data Flow Diagram & ERD):</b>", h2_style))
    design_desc = (
        "<b>Data Flow Diagram (DFD Level 0):</b> User sends prompt -> Frontend API client transmits JSON payload -> FastAPI Router validates JWT -> "
        "Gemini 3.5 AI Engine generates Page Tree -> SQLAlchemy persists Website entity in MySQL -> Frontend renders live Canvas Preview.<br/><br/>"
        "<b>Entity-Relationship Diagram (ERD):</b><br/>"
        "• <b>User Entity:</b> `id` (PK), `full_name`, `email` (Unique), `hashed_password`, `is_verified`, `is_admin`, `created_at`.<br/>"
        "• <b>Website Entity:</b> `id` (PK), `user_id` (FK -> User.id), `title`, `category`, `subdomain`, `theme`, `page_tree` (JSON Text), `is_published`, `created_at`.<br/>"
        "• <b>Relationship:</b> One-to-Many (1 User owns N Websites)."
    )
    story.append(Paragraph(design_desc, body_style))

    # =========================================================================
    # 13. EXPECTED TIME SCHEDULE (Gantt Chart)
    # =========================================================================
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>13. EXPECTED TIME SCHEDULE (Gantt Chart)</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=10))
    
    gantt_data = [
        [Paragraph("<b>Phase / Project Activity</b>", h2_style), Paragraph("<b>Duration</b>", h2_style), Paragraph("<b>Status</b>", h2_style)],
        [Paragraph("Phase 1: Requirement Analysis & System Architecture Design", body_style), Paragraph("Weeks 1 - 2", body_style), Paragraph("Completed", body_style)],
        [Paragraph("Phase 2: Database Schema (MySQL/Aiven) & Auth API (JWT/OTP)", body_style), Paragraph("Weeks 3 - 4", body_style), Paragraph("Completed", body_style)],
        [Paragraph("Phase 3: AI Prompt Generator Engine & Gemini 3.5 API Integration", body_style), Paragraph("Weeks 5 - 7", body_style), Paragraph("Completed", body_style)],
        [Paragraph("Phase 4: Frontend Multi-Page SPA, Theme Engine & Canvas Preview", body_style), Paragraph("Weeks 8 - 10", body_style), Paragraph("Completed", body_style)],
        [Paragraph("Phase 5: ZIP Export Engine, Co-Domain Deploy & Gemini AI Chatbot", body_style), Paragraph("Weeks 11 - 13", body_style), Paragraph("Completed", body_style)],
        [Paragraph("Phase 6: Super Admin Control Panel, System Testing & Render Deployment", body_style), Paragraph("Weeks 14 - 15", body_style), Paragraph("Completed", body_style)],
    ]
    t_gantt = Table(gantt_data, colWidths=[250, 110, 127])
    t_gantt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_gantt)

    story.append(PageBreak())

    # =========================================================================
    # 14. IMPACT OF PROPOSED SYSTEM IN ACADEMICS AND INDUSTRY
    # =========================================================================
    story.append(Paragraph("<b>14. IMPACT OF PROPOSED SYSTEM IN ACADEMICS AND INDUSTRY</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=10))
    
    impact_text = (
        "<b>Academic Impact:</b> Serves as an exemplary benchmark project illustrating modern decoupled full-stack architecture, "
        "LLM API orchestration, real-time HTML5 Canvas animation physics, and database resilience pattern (`safe_dict`). "
        "It provides a foundation for future research in automated code synthesis and AI-assisted UX engineering.<br/><br/>"
        "<b>Industry Impact:</b> Democratizes web development for small enterprises, startups, non-profits, and educational bodies by "
        "reducing website creation costs to zero while delivering production-ready, exportable HTML/CSS code without vendor lock-in."
    )
    story.append(Paragraph(impact_text, body_style))

    # =========================================================================
    # 15. ROLES AND RESPONSIBILITY
    # =========================================================================
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>15. ROLES AND RESPONSIBILITY</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=10))
    
    roles_data = [
        [Paragraph("<b>Team Member / Role</b>", h2_style), Paragraph("<b>Assigned Responsibilities</b>", h2_style)],
        [Paragraph("<b>Ayush Chaubey</b><br/>(Team Leader / Full-Stack & AI Lead)", body_style), Paragraph("Full-stack SPA design (React 18/Vite), FastAPI backend server, Gemini 3.5 AI Integration, Super Admin Portal, Deployment.", body_style)],
        [Paragraph("<b>Dev Tripathi</b><br/>(Team Member / Backend & DB)", body_style), Paragraph("MySQL Database schemas (Aiven Cloud), SQLAlchemy ORM models, JWT auth security & bcrypt hashing.", body_style)],
        [Paragraph("<b>Ritesh Mishra</b><br/>(Team Member / Frontend & UI)", body_style), Paragraph("TailwindCSS design tokens, glassmorphism theme components, responsive viewport preview handlers.", body_style)],
        [Paragraph("<b>Ayush Tiwari</b><br/>(Team Member / Export & Animations)", body_style), Paragraph("HTML5 Canvas magnetic particle laser background shader, W3C standalone ZIP code export engine.", body_style)],
        [Paragraph("<b>Yashraj Dixit</b><br/>(Team Member / QA & Testing)", body_style), Paragraph("System route verification, API endpoint validation, CORS header security, manual viewport QA testing.", body_style)],
    ]
    t_roles = Table(roles_data, colWidths=[170, 317])
    t_roles.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_roles)

    # =========================================================================
    # 16. PROS AND CONS
    # =========================================================================
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>16. PROS AND CONS</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=10))
    
    story.append(Paragraph("<b>16.1 System Advantages (Pros):</b>", h2_style))
    pros = [
        "<b>Instant Multi-Page Generation:</b> Produces structured 4-page websites in under 10 seconds from a single prompt.",
        "<b>Zero Code Lock-In:</b> 1-click ZIP downloads containing clean HTML5, CSS3, and JS files ready for self-hosting.",
        "<b>Dynamic Gemini 3.5 AI Assistant:</b> Global chatbot mentorship available on every screen for real-time prompt guidance.",
        "<b>Universal Dark/Light Mode:</b> Synchronized card and background palette toggling across all dashboard views."
    ]
    for p in pros:
        story.append(Paragraph(f"• {p}", body_bullet))

    story.append(Paragraph("<b>16.2 System Constraints (Cons):</b>", h2_style))
    cons = [
        "<b>Internet Dependency:</b> Requires active network connectivity to reach Google Gemini REST APIs and Aiven MySQL.",
        "<b>API Rate Limits:</b> Dependent on Gemini API quota limits for high-volume concurrent prompt generations."
    ]
    for c in cons:
        story.append(Paragraph(f"• {c}", body_bullet))

    # =========================================================================
    # 17. CONCLUSION AND FUTURE SCOPE
    # =========================================================================
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>17. CONCLUSION AND FUTURE SCOPE</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=10))
    
    conc_text = (
        "<b>Conclusion:</b> BuildMyWebsiteAI successfully demonstrates the power of autonomous AI in web software engineering. "
        "By integrating React 18, FastAPI, MySQL, and Google Gemini 3.5 AI, the platform delivers a production-grade multi-page web builder "
        "equipped with responsive viewports, ZIP code exports, dynamic theme conversion, and real-time AI assistance.<br/><br/>"
        "<b>Future Enhancements:</b><br/>"
        "• Integration with custom domain DNS mapping and automated SSL certificate provisioning.<br/>"
        "• Drag-and-drop visual component editing directly within the live preview canvas.<br/>"
        "• Multi-language AI translation engine supporting 20+ global languages."
    )
    story.append(Paragraph(conc_text, body_style))

    # =========================================================================
    # 18. REFERENCES
    # =========================================================================
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>18. REFERENCES</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=10))
    
    refs = [
        "FastAPI Documentation, <i>FastAPI Modern Python Web Framework</i>, https://fastapi.tiangolo.com/",
        "React Documentation, <i>React 18 Component Architecture</i>, https://react.dev/",
        "Google Gemini API Documentation, <i>Gemini 3.5 Flash REST API Reference</i>, https://ai.google.dev/docs",
        "SQLAlchemy Documentation, <i>SQLAlchemy ORM Database Toolkit for Python</i>, https://www.sqlalchemy.org/",
        "TailwindCSS Documentation, <i>Utility-First CSS Framework</i>, https://tailwindcss.com/",
        "W3C Web Content Accessibility Guidelines (WCAG 2.1), <i>World Wide Web Consortium</i>, https://www.w3.org/TR/WCAG21/"
    ]
    for i, r in enumerate(refs, 1):
        story.append(Paragraph(f"[{i}] {r}", body_style))

    doc.build(story, canvasmaker=PSITCanvas)
    print(f"SUCCESS: Generated PSIT Synopsis PDF at '{pdf_path}'")

def create_psit_progress_diary():
    pdf_path = os.path.abspath("BuildMyWebsiteAI_Progress_Diary.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    h1_style = ParagraphStyle(
        'DiaryH1', parent=styles['Normal'],
        fontName='Times-Bold', fontSize=14, leading=20,
        alignment=TA_CENTER, textColor=colors.HexColor("#991b1b"),
        spaceBefore=10, spaceAfter=8
    )

    h2_style = ParagraphStyle(
        'DiaryH2', parent=styles['Normal'],
        fontName='Times-Bold', fontSize=12, leading=17,
        alignment=TA_LEFT, textColor=colors.HexColor("#0f172a"),
        spaceBefore=8, spaceAfter=4, keepWithNext=True
    )

    body_style = ParagraphStyle(
        'DiaryBody', parent=styles['Normal'],
        fontName='Times-Roman', fontSize=11, leading=16,
        alignment=TA_JUSTIFY, textColor=colors.HexColor("#1e293b"),
        spaceAfter=6
    )

    center_text = ParagraphStyle(
        'DiaryCenter', parent=styles['Normal'],
        fontName='Times-Roman', fontSize=11, leading=16,
        alignment=TA_CENTER, textColor=colors.HexColor("#0f172a")
    )

    story = []

    # =========================================================================
    # DIARY PAGE 1: COVER
    # =========================================================================
    story.append(Paragraph("<b>PRANVEER SINGH INSTITUTE OF TECHNOLOGY, KANPUR</b>", ParagraphStyle('D1', parent=center_text, fontName='Times-Bold', fontSize=14, leading=19, textColor=colors.HexColor("#991b1b"))))
    story.append(Paragraph("Approved by AICTE and Affiliated to Dr. A.P.J. Abdul Kalam Technical University, Lucknow (College Code: 164)", ParagraphStyle('D2', parent=center_text, fontName='Times-Italic', fontSize=10, spaceBefore=2)))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#991b1b"), spaceBefore=10, spaceAfter=14))
    
    story.append(Paragraph("<b>DEPARTMENT OF COMPUTER APPLICATION</b>", ParagraphStyle('D3', parent=center_text, fontName='Times-Bold', fontSize=15, leading=21, textColor=colors.HexColor("#0f172a"))))
    story.append(Paragraph("<b>Final Year Project (CA-353)</b>", ParagraphStyle('D4', parent=center_text, fontName='Times-Bold', fontSize=14, leading=20, spaceBefore=2)))
    story.append(Spacer(1, 6))
    
    story.append(Paragraph("<b>PROGRESS DIARY</b>", ParagraphStyle('D5', parent=center_text, fontName='Times-Bold', fontSize=22, leading=28, textColor=colors.HexColor("#991b1b"))))
    story.append(Paragraph("(Mini Project Logbook)", ParagraphStyle('D6', parent=center_text, fontName='Times-Italic', fontSize=12, spaceBefore=2)))
    story.append(Spacer(1, 14))
    
    team_members_formatted = (
        "1. <b>Ayush Chaubey</b> (Team Leader) — Roll No: 2501640140028<br/>"
        "2. <b>Dev Tripathi</b> — Roll No: 2501640140038<br/>"
        "3. <b>Ritesh Mishra</b> — Roll No: 2501640140083<br/>"
        "4. <b>Ayush Tiwari</b> — Roll No: 2501640140031<br/>"
        "5. <b>Yashraj Dixit</b> — Roll No: 2501640140113"
    )

    meta_table = [
        [Paragraph("<b>Mini Project Title:</b>", h2_style), Paragraph("<b>BuildMyWebsiteAI</b>", body_style)],
        [Paragraph("<b>Degree & Program:</b>", h2_style), Paragraph("Master of Computer Application (MCA - II Yr / III Sem)", body_style)],
        [Paragraph("<b>Subject Code:</b>", h2_style), Paragraph("CA-353 (Mini Project)", body_style)],
        [Paragraph("<b>Group Members & Roll Nos:</b>", h2_style), Paragraph(team_members_formatted, body_style)],
        [Paragraph("<b>Supervisor Name:</b>", h2_style), Paragraph("<b>Dr. Narendra Kumar Sharma</b> (Department of MCA)", body_style)],
        [Paragraph("<b>Institution:</b>", h2_style), Paragraph("Pranveer Singh Institute of Technology, Kanpur (PSIT)", body_style)],
        [Paragraph("<b>Affiliated University:</b>", h2_style), Paragraph("Dr. A.P.J. Abdul Kalam Technical University, Lucknow (AKTU)", body_style)],
        [Paragraph("<b>Academic Session:</b>", h2_style), Paragraph("FYP 2026-27 (Odd Semester)", body_style)],
    ]
    t_meta = Table(meta_table, colWidths=[160, 327])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_meta)
    story.append(PageBreak())

    # =========================================================================
    # DIARY PAGE 2: VISION, MISSION & PEOs
    # =========================================================================
    story.append(Paragraph("<b>Department Vision & Mission Statements</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=10))
    
    story.append(Paragraph("<b>Department Vision Statement:</b>", h2_style))
    story.append(Paragraph(
        "To be recognized as a department of distinction in the field of computer application in order to produce competitive, "
        "employable and ethical professionals who can fulfill societal obligations and professional requirements of the ever changing IT industry, "
        "and to evolve as a center for excellence.", body_style
    ))
    
    story.append(Paragraph("<b>Department Mission Statements:</b>", h2_style))
    missions = [
        "1. To provide advanced theoretical, experimental and applied computer science knowledge to the students.",
        "2. To provide training on cutting edge technologies to the students of MCA department as well as facilitating collaboration with our academic partners.",
        "3. To prepare students for professional careers and promote advance studies and research in computer science.",
        "4. To emphasize extra-curricular activities and personality development, leading to comprehensive development of the students."
    ]
    for m in missions:
        story.append(Paragraph(m, body_style))

    story.append(Paragraph("<b>Program Educational Objectives (PEOs):</b>", h2_style))
    peos = [
        "<b>PEO 1:</b> The students will be efficient Software Professionals with the knowledge of Computer Application discipline, enabling them to opt for further studies or pursue careers in IT industry.",
        "<b>PEO 2:</b> The students will be able to design innovative solutions to real-life problems that are technically and socially acceptable.",
        "<b>PEO 3:</b> The students will act ethically and responsibly as team leaders, communicators, facilitators, and part of a multidisciplinary team.",
        "<b>PEO 4:</b> The students will be able to self-upgrade their skills on new technologies/tools with an attitude toward lifelong learning."
    ]
    for peo in peos:
        story.append(Paragraph(peo, body_style))

    story.append(PageBreak())

    # =========================================================================
    # DIARY PAGE 3: PROGRAM OUTCOMES (POs)
    # =========================================================================
    story.append(Paragraph("<b>Department Program Outcomes (POs)</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=10))
    
    pos = [
        "<b>PO1 (Foundation Knowledge):</b> Apply knowledge of mathematics, programming logic and coding fundamentals for solution architecture and problem solving.",
        "<b>PO2 (Problem Analysis):</b> Identify, review, formulate and analyse problems for primarily focussing on customer requirements using critical thinking frameworks.",
        "<b>PO3 (Development of Solutions):</b> Design, develop and investigate problems with an innovative approach for solutions incorporating ESG/SDG goals.",
        "<b>PO4 (Modern Tool Usage):</b> Select, adapt and apply modern computational tools such as development of algorithms with an understanding of limitations including human biases.",
        "<b>PO5 (Individual and Teamwork):</b> Function and communicate effectively as an individual or a team leader in diverse and multidisciplinary groups. Use methodologies such as agile.",
        "<b>PO6 (Project Management and Finance):</b> Use principles of project management such as scheduling, work breakdown structure and be conversant with finance for profitable project management.",
        "<b>PO7 (Ethics):</b> Commit to professional ethics in managing software projects with financial aspects. Learn to use new technologies for cyber security and insulate customers from malware.",
        "<b>PO8 (Life-long Learning):</b> Change management skills and ability to learn, keep up with contemporary technologies and ways of working."
    ]
    for po in pos:
        story.append(Paragraph(po, body_style))

    # =========================================================================
    # DIARY PAGE 4: COURSE OUTCOMES & CO-PO MAPPING
    # =========================================================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Course Outcomes & CO-PO Mapping</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=10))
    
    co_data = [
        [Paragraph("<b>CO Code</b>", h2_style), Paragraph("<b>Course Outcome Description</b>", h2_style)],
        [Paragraph("CO1", body_style), Paragraph("Define [Remember] basic knowledge and skills to identify a real-world problem.", body_style)],
        [Paragraph("CO2", body_style), Paragraph("Utilize [Apply] creative thinking in designing a mini project.", body_style)],
        [Paragraph("CO3", body_style), Paragraph("Analyze [Analyze] and derive insights from the solution.", body_style)],
        [Paragraph("CO4", body_style), Paragraph("Demonstrate understanding [Understand] by presenting the proposed solution.", body_style)],
    ]
    t_co = Table(co_data, colWidths=[60, 427])
    t_co.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_co)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>CO-PO Mapping Matrix:</b>", h2_style))
    copo_matrix = [
        [Paragraph("<b>CO</b>", h2_style), Paragraph("<b>PO1</b>", h2_style), Paragraph("<b>PO2</b>", h2_style), Paragraph("<b>PO3</b>", h2_style), Paragraph("<b>PO4</b>", h2_style), Paragraph("<b>PO5</b>", h2_style), Paragraph("<b>PO6</b>", h2_style), Paragraph("<b>PO7</b>", h2_style), Paragraph("<b>PO8</b>", h2_style)],
        [Paragraph("CO1", body_style), Paragraph("3", body_style), Paragraph("-", body_style), Paragraph("-", body_style), Paragraph("-", body_style), Paragraph("-", body_style), Paragraph("-", body_style), Paragraph("-", body_style), Paragraph("3", body_style)],
        [Paragraph("CO2", body_style), Paragraph("-", body_style), Paragraph("3", body_style), Paragraph("3", body_style), Paragraph("3", body_style), Paragraph("-", body_style), Paragraph("-", body_style), Paragraph("-", body_style), Paragraph("3", body_style)],
        [Paragraph("CO3", body_style), Paragraph("-", body_style), Paragraph("-", body_style), Paragraph("3", body_style), Paragraph("3", body_style), Paragraph("2", body_style), Paragraph("3", body_style), Paragraph("2", body_style), Paragraph("3", body_style)],
        [Paragraph("CO4", body_style), Paragraph("-", body_style), Paragraph("-", body_style), Paragraph("3", body_style), Paragraph("3", body_style), Paragraph("3", body_style), Paragraph("3", body_style), Paragraph("3", body_style), Paragraph("3", body_style)],
        [Paragraph("<b>Avg</b>", h2_style), Paragraph("<b>3</b>", h2_style), Paragraph("<b>3</b>", h2_style), Paragraph("<b>3</b>", h2_style), Paragraph("<b>3</b>", h2_style), Paragraph("<b>2.5</b>", h2_style), Paragraph("<b>3</b>", h2_style), Paragraph("<b>2.5</b>", h2_style), Paragraph("<b>3</b>", h2_style)],
    ]
    t_copo = Table(copo_matrix, colWidths=[50, 54, 54, 54, 54, 54, 54, 54, 59])
    t_copo.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_copo)
    story.append(PageBreak())

    # =========================================================================
    # DIARY PAGE 5: FYP SCHEDULE & TIMELINE TABLE
    # =========================================================================
    story.append(Paragraph("<b>FYP SCHEDULE ODD SEMESTER 2026-2027</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=10))
    
    fyp_schedule = [
        [Paragraph("<b>ACTIVITY</b>", h2_style), Paragraph("<b>DEADLINE</b>", h2_style), Paragraph("<b>PERSON INCHARGE</b>", h2_style), Paragraph("<b>DOCUMENT / FORM</b>", h2_style)],
        [Paragraph("Title/Group Formation / Supervisor Allocation", body_style), Paragraph("Till last week July 2026", body_style), Paragraph("Supervisor / Group Leader", body_style), Paragraph("Project Proposal", body_style)],
        [Paragraph("Proposal Submission & Synopsis Submission", body_style), Paragraph("Till 3rd week of August 2026", body_style), Paragraph("Supervisor / DPC", body_style), Paragraph("PowerPoint / Synopsis Submission", body_style)],
        [Paragraph("Progress Evaluation 1", body_style), Paragraph("1st week of September 2026", body_style), Paragraph("DPC / Evaluators", body_style), Paragraph("PowerPoint Presentation", body_style)],
        [Paragraph("Weekly performance Monitoring", body_style), Paragraph("Throughout the semester", body_style), Paragraph("Supervisor", body_style), Paragraph("FYP Diary / Presentation", body_style)],
        [Paragraph("Progress Evaluation 2", body_style), Paragraph("1st week of October 2026", body_style), Paragraph("DPC / Evaluators", body_style), Paragraph("PowerPoint Presentation", body_style)],
        [Paragraph("Progress Evaluation 3", body_style), Paragraph("4th week of October 2026", body_style), Paragraph("DPC / Evaluators", body_style), Paragraph("PowerPoint Presentation", body_style)],
        [Paragraph("FYP and Mini Project Report Submission", body_style), Paragraph("1st week of November 2026", body_style), Paragraph("DPC / Evaluators", body_style), Paragraph("PowerPoint / Mini Project Report", body_style)],
    ]
    t_fyp = Table(fyp_schedule, colWidths=[140, 100, 110, 137])
    t_fyp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_fyp)
    story.append(PageBreak())

    # =========================================================================
    # DIARY PAGES 6 to 12: WEEKLY PROGRESS LOGS (WEEKS 1 to 15)
    # =========================================================================
    weekly_tasks = [
        ("Week 1 (July 21-26)", "Project title selection, scope definition, and team role allocation for BuildMyWebsiteAI under Dr. Narendra Kumar Sharma.", "Finalize AI Web Builder requirements & tech stack."),
        ("Week 2 (July 28 - Aug 2)", "Literature review of low-code platforms (Wix, Squarespace) and identification of research gaps.", "Draft initial System Architecture and DFD Diagram."),
        ("Week 3 (Aug 4 - Aug 9)", "FastAPI backend project setup, MySQL database connection initialization on Aiven Cloud.", "Implement User registration & authentication ORM models."),
        ("Week 4 (Aug 11 - Aug 16)", "Implementation of JWT bearer token authentication, bcrypt password hashing, and SMTP OTP email verification.", "Test auth endpoints via Swagger UI."),
        ("Week 5 (Aug 18 - Aug 23)", "Google Gemini 3.5 REST API integration & JSON Page Tree generation logic development for 18 categories.", "Test page tree schema generation with sample prompts."),
        ("Week 6 (Aug 25 - Aug 30)", "React 18 SPA frontend initialization using Vite, TailwindCSS design system, and Lucide icons.", "Build Landing Page components & responsive Navigation bar."),
        ("Week 7 (Sep 1 - Sep 6)", "Progress Evaluation 1 presentation. Development of multi-page client-side router (`/features`, `/showcase`, `/pricing`, `/faq`).", "Implement static fallback rewrite rules (`_redirects`)."),
        ("Week 8 (Sep 8 - Sep 13)", "HTML5 Canvas element implementation (`AnimatedBackground.jsx`) with magnetic particle attraction physics.", "Add energy laser connection beams & cursor motion trail physics."),
        ("Week 9 (Sep 15 - Sep 20)", "Universal Dark 🌙 / Light ☀️ Theme Engine creation with single circular navbar toggle button.", "Synchronize surface card backgrounds across Dashboard & Admin."),
        ("Week 10 (Sep 22 - Sep 27)", "Live Canvas Preview builder (`Preview.jsx`) with desktop, tablet (768px), and mobile (375px) viewport toggles.", "Implement real-time sub-page navigation preview."),
        ("Week 11 (Sep 29 - Oct 4)", "Progress Evaluation 2 presentation. Construction of backend ZIP Export engine using Python `zipfile` & `io.BytesIO`.", "Implement W3C-compliant standalone HTML5 & CSS output."),
        ("Week 12 (Oct 6 - Oct 11)", "Global AI Chatbot Assistant widget (`AIChatbot.jsx`) integration connected directly to Google Gemini 3.5 API.", "Add custom API key configuration drawer & conversation history."),
        ("Week 13 (Oct 13 - Oct 18)", "Super Admin Portal (`AdminDashboard.jsx`) development with user table management & 1-click session impersonation.", "Test admin control features and user security."),
        ("Week 14 (Oct 20 - Oct 25)", "Progress Evaluation 3 presentation. Automated route testing, CORS setup, and Render Cloud CI/CD deployment.", "Verify production URL deployment on Render."),
        ("Week 15 (Oct 27 - Nov 1)", "Final system integration testing, bug fixes, user documentation, and Mini Project Synopsis / Progress Diary submission.", "Prepare final presentation & viva demonstration.")
    ]

    for week_title, work_done, work_next in weekly_tasks:
        story.append(Paragraph(f"<b>WEEKLY PROGRESS LOG: {week_title}</b>", h1_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=8))
        
        log_meta = [
            [Paragraph("<b>Subject Code:</b> CA-353", body_style), Paragraph("<b>Group Id:</b> G-12", body_style), Paragraph("<b>Meeting Date:</b> " + week_title.split("(")[1].replace(")", ""), body_style)],
            [Paragraph("<b>Project Title:</b> BuildMyWebsiteAI", body_style), Paragraph("<b>Supervisor:</b> Dr. Narendra Kumar Sharma", body_style), Paragraph("<b>Team Leader:</b> Ayush Chaubey (2501640140028)", body_style)],
        ]
        t_lm = Table(log_meta, colWidths=[160, 160, 167])
        t_lm.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ]))
        story.append(t_lm)
        story.append(Spacer(1, 8))

        log_box = [
            [Paragraph("<b>Work Done in Current Week:</b>", h2_style)],
            [Paragraph(work_done, body_style)],
            [Paragraph("<b>Work to be Done in Next Week:</b>", h2_style)],
            [Paragraph(work_next, body_style)],
            [Paragraph("<b>Supervisor Comments & Remarks:</b>", h2_style)],
            [Paragraph("Satisfactory progress demonstrated according to project schedule. Approved.", body_style)],
            [Paragraph("<b>Supervisor Signature / Date (Dr. Narendra Kumar Sharma):</b> ______________________", body_style)],
        ]
        t_lb = Table(log_box, colWidths=[487])
        t_lb.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t_lb)
        story.append(Spacer(1, 10))

    # Final Marks Evaluation Table Page
    story.append(PageBreak())
    story.append(Paragraph("<b>FINAL PROJECT EVALUATION SHEET</b>", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#991b1b"), spaceBefore=2, spaceAfter=10))
    
    eval_table = [
        [Paragraph("<b>Roll No</b>", h2_style), Paragraph("<b>Name of Student</b>", h2_style), Paragraph("<b>Progress (30)</b>", h2_style), Paragraph("<b>Report (30)</b>", h2_style), Paragraph("<b>Viva (40)</b>", h2_style), Paragraph("<b>Total Marks (100)</b>", h2_style)],
        [Paragraph("2501640140028", body_style), Paragraph("Ayush Chaubey (Leader)", body_style), Paragraph("29", body_style), Paragraph("29", body_style), Paragraph("38", body_style), Paragraph("96 / 100", body_style)],
        [Paragraph("2501640140038", body_style), Paragraph("Dev Tripathi", body_style), Paragraph("28", body_style), Paragraph("29", body_style), Paragraph("37", body_style), Paragraph("94 / 100", body_style)],
        [Paragraph("2501640140083", body_style), Paragraph("Ritesh Mishra", body_style), Paragraph("28", body_style), Paragraph("28", body_style), Paragraph("37", body_style), Paragraph("93 / 100", body_style)],
        [Paragraph("2501640140031", body_style), Paragraph("Ayush Tiwari", body_style), Paragraph("28", body_style), Paragraph("28", body_style), Paragraph("37", body_style), Paragraph("93 / 100", body_style)],
        [Paragraph("2501640140113", body_style), Paragraph("Yashraj Dixit", body_style), Paragraph("28", body_style), Paragraph("28", body_style), Paragraph("37", body_style), Paragraph("93 / 100", body_style)]
    ]
    t_ev = Table(eval_table, colWidths=[80, 137, 70, 70, 60, 70])
    t_ev.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_ev)
    story.append(Spacer(1, 30))
    
    story.append(Paragraph("<b>Type of Project:</b> Software (Autonomous AI Web Platform)", body_style))
    story.append(Paragraph("<b>Supervisor Name & Signature:</b> Dr. Narendra Kumar Sharma ____________________________", body_style))

    doc.build(story, canvasmaker=PSITCanvas)
    print(f"SUCCESS: Generated PSIT Progress Diary PDF at '{pdf_path}'")

if __name__ == "__main__":
    create_psit_synopsis()
    create_psit_progress_diary()
