import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# Output directory
OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "sample_sops"))
os.makedirs(OUTPUT_DIR, exist_ok=True)


class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and print 'Page X of Y' in the running footer.
    """
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#475569"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, getattr(self, "doc_header_title", "STANDARD OPERATING PROCEDURE"))
            self.drawRightString(558, 750, getattr(self, "doc_id_label", "SOP"))
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 744, 558, 744)

        # Running Footer
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "CONFIDENTIAL – ENTERPRISE OPERATIONAL USE ONLY")
        self.drawRightString(558, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def build_sop_mnt_001():
    pdf_path = os.path.join(OUTPUT_DIR, "SOP-MNT-001.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    primary_color = colors.HexColor("#0B1120")
    accent_teal = colors.HexColor("#0D9488")
    accent_blue = colors.HexColor("#0284C7")
    text_dark = colors.HexColor("#0F172A")
    bg_subtle = colors.HexColor("#F8FAFC")
    border_color = colors.HexColor("#E2E8F0")

    style_title = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color,
        spaceAfter=4
    )
    style_subtitle = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=accent_teal,
        spaceAfter=12
    )
    style_h1 = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    style_h2 = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=accent_blue,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )
    style_body = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_dark,
        spaceAfter=6
    )
    style_bullet = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_dark,
        leftIndent=15,
        spaceAfter=3
    )
    style_callout = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#B45309")
    )
    style_th = ParagraphStyle(
        'TableHead',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )
    style_td = ParagraphStyle(
        'TableData',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=text_dark
    )

    story = []

    # Title & Metadata Banner
    story.append(Paragraph("OPERA ENTERPRISE TECHNICAL STANDARD", style_subtitle))
    story.append(Paragraph("SOP-MNT-001: Industrial Machine Preventive Maintenance", style_title))
    story.append(Paragraph("Standard Operating Procedure for CNC Machining Centers & Hydraulic Press Systems", style_body))
    story.append(Spacer(1, 8))

    meta_table_data = [
        [
            Paragraph("<b>Document ID:</b> SOP-MNT-001", style_td),
            Paragraph("<b>Effective Date:</b> 2026-04-01", style_td),
            Paragraph("<b>Version:</b> 2.1", style_td)
        ],
        [
            Paragraph("<b>Category:</b> Industrial Maintenance", style_td),
            Paragraph("<b>Review Cycle:</b> Annual", style_td),
            Paragraph("<b>Classification:</b> Operational Tier-1", style_td)
        ]
    ]
    meta_table = Table(meta_table_data, colWidths=[168, 168, 168])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_subtle),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # 1. Purpose
    story.append(Paragraph("1. Purpose", style_h1))
    story.append(Paragraph(
        "The purpose of preventive maintenance under SOP-MNT-001 is to establish a standardized protocol for scheduled "
        "inspection, precision lubrication, mechanical calibration, and electrical integrity checks on heavy production machinery. "
        "Adherence to this procedure minimizes unplanned downtime, prevents catastrophic mechanical spindle failure, ensures operator safety, "
        "maximizes Mean Time Between Failures (MTBF), and guarantees compliance with ISO 9001 and OSHA machine safety guidelines.",
        style_body
    ))

    # 2. Scope
    story.append(Paragraph("2. Scope", style_h2))
    story.append(Paragraph(
        "This standard operating procedure applies to all facility maintenance engineers, industrial technicians, and machine operators "
        "operating heavy industrial manufacturing assets across Plant Facilities A and B. Specifically, the scope encompasses "
        "3-axis and 5-axis CNC Milling Centers, Industrial Hydraulic Presses (HP-200 and HP-500 series), High-Torque Spindle Drives, "
        "and Pneumatic Clamping Fixtures.",
        style_body
    ))

    # 3. Roles and Responsibilities
    story.append(Paragraph("3. Roles and Responsibilities", style_h1))
    story.append(Paragraph("• <b>Machine Operator:</b> Conducts daily pre-shift visual walk-arounds, verifies fluid levels, records cycle run times, and immediately reports abnormal acoustic signatures or vibration spikes.", style_bullet))
    story.append(Paragraph("• <b>Maintenance Technician:</b> Executes weekly and monthly mechanical, electrical, and pneumatic PM checklists; performs precision lubrication; replaces filter elements; and records micrometer alignment tolerances.", style_bullet))
    story.append(Paragraph("• <b>Shift Supervisor:</b> Validates Lockout/Tagout (LOTO) clearances, approves maintenance work orders, reviews completed PM logs, and coordinates operational shift handovers.", style_bullet))
    story.append(Paragraph("• <b>Lead Maintenance Engineer:</b> Investigates recurring failures, analyzes infrared thermography and vibration FFT spectrum data, approves engineering change requests, and manages OEM vendor escalations.", style_bullet))

    # 4. Required Tools and Equipment
    story.append(Paragraph("4. Required Tools and Equipment", style_h1))
    story.append(Paragraph("Technicians must verify calibration certs prior to performing maintenance. Required apparatus includes:", style_body))
    story.append(Paragraph("• <b>Electrical & Diagnostics:</b> Digital multimeter (CAT III 1000V rated), insulation resistance tester (Megger 500V), Fluke Ti480 infrared thermal imaging camera.", style_bullet))
    story.append(Paragraph("• <b>Mechanical & Torque:</b> Calibrated torque wrench set (10 Nm – 150 Nm, calibrated within ±3%), dial test indicator (0.001mm resolution), laser shaft alignment tool.", style_bullet))
    story.append(Paragraph("• <b>Fluids & Lubricants:</b> ISO VG 68 anti-wear hydraulic oil, NLGI Grade 2 lithium complex synthetic grease, industrial fluid transfer pump.", style_bullet))
    story.append(Paragraph("• <b>Safety Equipment:</b> Level 2 arc flash face shield, composite safety glasses, ASTM F2413 steel-toe footwear, thermal heat-resistant gloves, and OSHA-compliant red padlocks for LOTO.", style_bullet))

    # 5. Safety Precautions & Lockout/Tagout (LOTO)
    story.append(Paragraph("5. Safety Precautions & Hazard Controls", style_h1))
    
    callout_data = [[
        Paragraph("<b>CRITICAL SAFETY MANDATE (OSHA 1910.147):</b> Never perform maintenance inside the machine envelope without zero-energy verification. De-energize main electrical breaker, apply assigned padlock, exhaust pneumatic accumulator pressure, and mechanically pin hydraulic safety rams before opening service panels.", style_callout)
    ]]
    callout_table = Table(callout_data, colWidths=[504])
    callout_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEF3C7")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#F59E0B")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(callout_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("• <b>Zero-Energy State Verification:</b> Attempt local machine restart after LOTO to confirm total power isolation.", style_bullet))
    story.append(Paragraph("• <b>Pneumatic Depressurization:</b> Open the manual air dump valve and verify the pressure gauge reads 0.0 bar before disconnecting supply lines.", style_bullet))
    story.append(Paragraph("• <b>Hydraulic Fluid Hazards:</b> High-pressure injection injury can occur up to 250 bar. Never use bare hands to check for hydraulic leaks; use cardboard or inspection mirrors.", style_bullet))

    # 6. Step-by-Step Maintenance Procedure
    story.append(Paragraph("6. Step-by-Step Preventive Maintenance Procedure", style_h1))
    story.append(Paragraph("<b>Step 1: Machine De-energization and Work Area Safety</b><br/>Notify production supervisor, gracefully stop current program cycle, bring all axes to safe reference home positions, disengage spindle drive, and execute 6-step Lockout/Tagout protocol.", style_body))
    story.append(Paragraph("<b>Step 2: External Cleaning and Debris Evacuation</b><br/>Remove metal chips, shavings, and swarf from way covers, telescopic bellows, and tool magazine pockets using industrial HEPA vacuums. Do not use compressed air guns exceeding 30 PSI.", style_body))
    story.append(Paragraph("<b>Step 3: Linear Guides and Ballscrew Inspection</b><br/>Retract way covers. Inspect linear guideway rails for scoring, pitting, or galling. Check ballscrew backlash using dial test indicator. Backlash exceeding 0.015mm requires immediate carriage adjustment.", style_body))
    story.append(Paragraph("<b>Step 4: Lubrication Replenishment and Fluid Service</b><br/>Inspect central automatic lubrication pump reservoir. If level is below 25%, replenish with ISO VG 68 oil. Using grease gun, inject exactly two pumps (approx. 3.0 grams) of NLGI Grade 2 synthetic grease into ballscrew wiper grease nipples.", style_body))
    story.append(Paragraph("<b>Step 5: Spindle Drive and Belt Tension Calibration</b><br/>Inspect drive belt for fraying, tooth shearing, or glazing. Measure belt frequency deflection using sonic tension meter. Retorque spindle mounting fasteners to 45 Nm in star pattern.", style_body))
    story.append(Paragraph("<b>Step 6: Electrical Enclosure and Cooling System Check</b><br/>Vacuum dust from VFD cabinet intake heat sinks. Verify cabinet cooling fan operates at full RPM. Clean or replace washable foam air filter pads. Inspect contactors for electrical pitting.", style_body))
    story.append(Paragraph("<b>Step 7: Re-energization, Homing & Test Run Verification</b><br/>Remove all tools and personnel from machine envelope. Remove LOTO locks in accordance with facility procedure. Power on CNC controller, execute reference homing cycle, and run 10-minute dry-run test program MNT-DRY-01 while monitoring spindle bearing vibration.", style_body))

    # 7. Inspection Checklist Table
    story.append(Spacer(1, 6))
    story.append(Paragraph("7. Comprehensive Inspection Checklist", style_h1))
    
    chk_data = [
        [
            Paragraph("Item", style_th),
            Paragraph("Component Checked", style_th),
            Paragraph("Inspection Method", style_th),
            Paragraph("Acceptance Standard", style_th),
            Paragraph("Frequency", style_th)
        ],
        [
            Paragraph("1", style_td),
            Paragraph("Hydraulic Oil Reservoir", style_td),
            Paragraph("Visual sight glass inspection", style_td),
            Paragraph("Level between MIN/MAX; amber color; no foam", style_td),
            Paragraph("Daily", style_td)
        ],
        [
            Paragraph("2", style_td),
            Paragraph("Pneumatic FRL Unit", style_td),
            Paragraph("Pressure gauge reading", style_td),
            Paragraph("6.0 bar ± 0.2 bar; moisture bowl empty", style_td),
            Paragraph("Daily", style_td)
        ],
        [
            Paragraph("3", style_td),
            Paragraph("Way Lube Pressure", style_td),
            Paragraph("Manometer reading during lube cycle", style_td),
            Paragraph("12 bar to 15 bar discharge pulse", style_td),
            Paragraph("Weekly", style_td)
        ],
        [
            Paragraph("4", style_td),
            Paragraph("Spindle Bearing Vibration", style_td),
            Paragraph("Tri-axial accelerometer probe", style_td),
            Paragraph("< 2.8 mm/s RMS at 6000 RPM (ISO 10816)", style_td),
            Paragraph("Monthly", style_td)
        ],
        [
            Paragraph("5", style_td),
            Paragraph("Hydraulic Fluid Quality", style_td),
            Paragraph("Spectrographic particulate count", style_td),
            Paragraph("ISO 4406 Cleanliness Code 18/16/13", style_td),
            Paragraph("Quarterly", style_td)
        ],
        [
            Paragraph("6", style_td),
            Paragraph("Emergency Stop Circuits", style_td),
            Paragraph("Physical trip of each E-stop button", style_td),
            Paragraph("Full motion halt < 0.5 sec; master contactor drop", style_td),
            Paragraph("Monthly", style_td)
        ]
    ]
    chk_table = Table(chk_data, colWidths=[24, 110, 130, 180, 60])
    chk_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_subtle]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(chk_table)

    # 8. Common Machine Faults and Corrective Actions
    story.append(Spacer(1, 8))
    story.append(Paragraph("8. Common Faults & Corrective Actions", style_h1))
    story.append(Paragraph("When an operator or technician identifies a machine fault, execute the following verified corrective steps:", style_body))
    
    fault_data = [
        [
            Paragraph("Identified Symptom", style_th),
            Paragraph("Probable Root Cause", style_th),
            Paragraph("Immediate Corrective Action Protocol", style_th)
        ],
        [
            Paragraph("Spindle excessive noise or vibration (> 2.8 mm/s)", style_td),
            Paragraph("Tool unbalance, bearing pre-load loss, or chuck misalignment", style_td),
            Paragraph("Stop spindle immediately. Inspect toolholder taper for chips/runout. Check bearing thermal delta using IR gun. If vibration persists with balanced test arbor, tag machine out for bearing replacement.", style_td)
        ],
        [
            Paragraph("Hydraulic oil temperature exceeds 55°C", style_td),
            Paragraph("Heat exchanger clogged, oil viscosity degraded, or relief valve stuck", style_td),
            Paragraph("Check heat exchanger cooling water flow. Clean air-blast radiator fins. Inspect main system relief valve setting (180 bar). Verify pump is not cavitating.", style_td)
        ],
        [
            Paragraph("Axis positional error / Servo tracking alarm", style_td),
            Paragraph("Ballscrew backlash, encoder optical contamination, or low way lubrication", style_td),
            Paragraph("Verify manual lubrication delivery to all axis guide blocks. Clean linear encoder glass scale with isopropyl alcohol. Check ballscrew thrust bearing locknut torque.", style_td)
        ],
        [
            Paragraph("Pneumatic clamp low pressure drop (< 5.0 bar)", style_td),
            Paragraph("Main supply regulator leak, worn cylinder seals, or line puncture", style_td),
            Paragraph("Isolate pneumatic feed. Apply ultrasonic leak detector to manifold fittings. Replace worn polyurethane air lines. Verify regulator lock collar is engaged.", style_td)
        ]
    ]
    fault_table = Table(fault_data, colWidths=[130, 130, 244])
    fault_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_subtle]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(fault_table)

    # 9. Escalation Procedure
    story.append(Spacer(1, 8))
    story.append(Paragraph("9. Escalation Procedure", style_h1))
    story.append(Paragraph(
        "Issues identified during inspection or operation must be escalated according to the following strict criteria:",
        style_body
    ))
    story.append(Paragraph("• <b>Level 1 Escalation (Operational Anomaly):</b> Minor fluid seepage (< 5 drops/min) or cosmetic belt wear. Action: Log in CMMS work order system, replenish fluid, and schedule repair for the next shift handover.", style_bullet))
    story.append(Paragraph("• <b>Level 2 Escalation (Component Degradation):</b> Vibration reading between 2.8 mm/s and 4.5 mm/s, thermal drift exceeding 15°C above ambient, or repeated sensor timeout. Action: Escalate immediately to Maintenance Shift Supervisor within 30 minutes; suspend high-speed finishing cycles.", style_bullet))
    story.append(Paragraph("• <b>Level 3 Critical Escalation (Safety / Imminent Failure):</b> Spindle bearing seizure, hydraulic pressure loss exceeding 20%, failure of any Emergency Stop button, structural casting crack, or smoke/burning odor. Action: Immediately hit Emergency Stop, lock out machine, clear area, and notify the Lead Maintenance Engineer and Operations Plant Manager within 15 minutes.", style_bullet))

    # 10. Documentation and Maintenance Records
    story.append(Paragraph("10. Documentation & Maintenance Records", style_h1))
    story.append(Paragraph(
        "All preventive maintenance activities must be documented within 60 minutes of completion in the facility CMMS. "
        "Records must capture: machine serial number, technician badge ID, elapsed operating hours, exact volume and batch numbers of lubricants added, "
        "quantitative vibration readings (X, Y, Z axes), digital signatures, and signed LOTO clearance permits. Hardcopy work orders must be "
        "archived in the Maintenance Records Office for a minimum of 5 years to satisfy statutory audit standards.",
        style_body
    ))

    # 11. Approval Section & 12. Revision History
    story.append(Spacer(1, 6))
    story.append(Paragraph("11. Document Approvals", style_h1))
    
    appr_data = [
        [Paragraph("Role / Authority", style_th), Paragraph("Name & Title", style_th), Paragraph("Signature / Verification", style_th), Paragraph("Date", style_th)],
        [Paragraph("Lead Maintenance Author", style_td), Paragraph("Marcus Vance, Maintenance Specialist", style_td), Paragraph("M. Vance (Verified)", style_td), Paragraph("2026-03-25", style_td)],
        [Paragraph("EHS Safety Officer", style_td), Paragraph("Sarah Chen, Senior Safety Engineer", style_td), Paragraph("S. Chen (Verified)", style_td), Paragraph("2026-03-28", style_td)],
        [Paragraph("Operations Plant Director", style_td), Paragraph("David Sterling, VP Plant Operations", style_td), Paragraph("D. Sterling (Approved)", style_td), Paragraph("2026-03-31", style_td)]
    ]
    appr_table = Table(appr_data, colWidths=[120, 150, 150, 84])
    appr_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_subtle]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(appr_table)

    story.append(Spacer(1, 6))
    story.append(Paragraph("12. Document Revision History", style_h1))
    rev_data = [
        [Paragraph("Version", style_th), Paragraph("Release Date", style_th), Paragraph("Description of Modifications", style_th), Paragraph("Approved By", style_th)],
        [Paragraph("1.0", style_td), Paragraph("2024-03-15", style_td), Paragraph("Initial baseline preventive maintenance procedure release", style_td), Paragraph("D. Sterling", style_td)],
        [Paragraph("2.0", style_td), Paragraph("2025-04-10", style_td), Paragraph("Added hydraulic accumulator residual energy bleed protocol & OSHA LOTO steps", style_td), Paragraph("S. Chen", style_td)],
        [Paragraph("2.1", style_td), Paragraph("2026-04-01", style_td), Paragraph("Updated spindle vibration limits to ISO 10816-3 and refined oil cleanliness standards", style_td), Paragraph("M. Vance", style_td)]
    ]
    rev_table = Table(rev_data, colWidths=[50, 80, 290, 84])
    rev_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_subtle]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(rev_table)

    def on_page(canvas_obj, document_obj):
        canvas_obj.doc_header_title = "STANDARD OPERATING PROCEDURE: INDUSTRIAL MAINTENANCE"
        canvas_obj.doc_id_label = "SOP-MNT-001 | Rev 2.1"

    doc.build(story, canvasmaker=NumberedCanvas, onFirstPage=on_page, onLaterPages=on_page)
    print(f"Built {pdf_path}")


def build_sop_it_002():
    pdf_path = os.path.join(OUTPUT_DIR, "SOP-IT-002.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    primary_color = colors.HexColor("#0B1120")
    accent_teal = colors.HexColor("#0D9488")
    accent_cyan = colors.HexColor("#0284C7")
    text_dark = colors.HexColor("#0F172A")
    bg_subtle = colors.HexColor("#F8FAFC")
    border_color = colors.HexColor("#E2E8F0")

    style_title = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color,
        spaceAfter=4
    )
    style_subtitle = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=accent_cyan,
        spaceAfter=12
    )
    style_h1 = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    style_h2 = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=accent_teal,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )
    style_body = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_dark,
        spaceAfter=6
    )
    style_bullet = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_dark,
        leftIndent=15,
        spaceAfter=3
    )
    style_th = ParagraphStyle(
        'TableHead',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )
    style_td = ParagraphStyle(
        'TableData',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=text_dark
    )

    story = []

    # Title & Metadata Banner
    story.append(Paragraph("OPERA ENTERPRISE TECHNICAL STANDARD", style_subtitle))
    story.append(Paragraph("SOP-IT-002: IT Network Troubleshooting & Incident Resolution", style_title))
    story.append(Paragraph("Standard Operating Procedure for Enterprise Core, Distribution, and Wireless Networks", style_body))
    story.append(Spacer(1, 8))

    meta_table_data = [
        [
            Paragraph("<b>Document ID:</b> SOP-IT-002", style_td),
            Paragraph("<b>Effective Date:</b> 2026-05-15", style_td),
            Paragraph("<b>Version:</b> 3.0", style_td)
        ],
        [
            Paragraph("<b>Category:</b> Network Management", style_td),
            Paragraph("<b>Review Cycle:</b> Annual", style_td),
            Paragraph("<b>Classification:</b> Enterprise Confidential", style_td)
        ]
    ]
    meta_table = Table(meta_table_data, colWidths=[168, 168, 168])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_subtle),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # 1. Purpose
    story.append(Paragraph("1. Purpose", style_h1))
    story.append(Paragraph(
        "The purpose of SOP-IT-002 is to establish a rigorous, disciplined engineering methodology for rapidly diagnosing, "
        "triaging, and resolving enterprise network disruptions. This procedure enforces structured fault isolation across the OSI stack, "
        "eliminates ad-hoc troubleshooting practices, ensures consistent root-cause documentation, and establishes rapid recovery paths "
        "to satisfy stringent service level agreements (99.999% uptime).",
        style_body
    ))

    # 2. Scope
    story.append(Paragraph("2. Scope", style_h2))
    story.append(Paragraph(
        "This standard applies to all Network Operations Center (NOC) personnel, Network Infrastructure Engineers, and Security Ops engineers. "
        "The scope covers corporate campus LAN switches (Cisco Catalyst 9300/9500), Datacenter Core fabrics (Arista 7050 & Cisco Nexus 9000), "
        "Enterprise Next-Gen Firewalls (Palo Alto Networks PA-5200 series), SD-WAN edge gateways, and Enterprise Wireless LAN Controllers (WLC).",
        style_body
    ))

    # 3. Roles and Responsibilities
    story.append(Paragraph("3. Roles and Responsibilities", style_h1))
    story.append(Paragraph("• <b>NOC Tier-1 Analyst:</b> Performs initial alert ingestion, validates scope of outage, logs initial ITSM incident ticket, collects baseline diagnostic outputs, and applies first-contact remediation checklists.", style_bullet))
    story.append(Paragraph("• <b>Network Operations Engineer (Tier-2):</b> Investigates Layer 2 spanning-tree topology shifts, dynamic routing protocol neighbor drops (BGP, OSPF), VLAN access control lists, and analyzes network packet traces (PCAP).", style_bullet))
    story.append(Paragraph("• <b>Principal Network Architect (Tier-3):</b> Takes ownership of Sev-1 outages, engages hardware vendor TAC support, coordinates emergency firmware workarounds, and leads post-incident architecture reviews.", style_bullet))
    story.append(Paragraph("• <b>Incident Commander (IC):</b> Owns executive bridge coordination, communicates outage updates to enterprise business stakeholders every 30 minutes, and approves emergency change control exemptions.", style_bullet))

    # 4. Initial Incident Identification
    story.append(Paragraph("4. Initial Incident Identification", style_h1))
    story.append(Paragraph(
        "Network disruptions are identified through three primary ingestion channels: (1) Automated SNMP/gNMI telemetry alerts from SolarWinds and Datadog; "
        "(2) Syslog facility trap notifications indicating link flaps or BGP state changes; or (3) End-user incident reports via ITSM service portal. "
        "Upon detection, the incident must be classified by severity: P1 Critical (enterprise core outage), P2 High (redundancy lost, degraded service), "
        "P3 Medium (single department impacted), or P4 Low (isolated individual port failure).",
        style_body
    ))

    # 5. Mandatory Information Collection
    story.append(Paragraph("5. Mandatory Information Collection", style_h1))
    story.append(Paragraph(
        "Before modifying any production network configuration or bouncing interfaces, the responding engineer must collect and record the following information:",
        style_body
    ))
    story.append(Paragraph("• <b>1. Affected IP Addressing and Topology Context:</b> Source and destination IP addresses, VLAN IDs, default gateway IP, and affected VRF name.", style_bullet))
    story.append(Paragraph("• <b>2. Timing and Blast Radius:</b> Precise timestamp of first packet drop, number of impacted users or services, and whether recent changes were executed during the preceding 2 hours.", style_bullet))
    story.append(Paragraph("• <b>3. Baseline Command Outputs:</b> Record outputs of: <code>show ip interface brief</code>, <code>show ip route &lt;destination_ip&gt;</code>, <code>show mac address-table</code>, and <code>show interface status err-disabled</code>.", style_bullet))
    story.append(Paragraph("• <b>4. Packet Loss and Path Telemetry:</b> Execute: <code>ping -c 100 -s 1472 &lt;target_ip&gt;</code> and <code>traceroute -m 30 &lt;target_ip&gt;</code> to establish the exact drop hop.", style_bullet))
    story.append(Paragraph("• <b>5. Interface Error Counters:</b> Collect interface statistics: <code>show interface counters errors</code> (inspect for CRC errors, input drops, frame collisions, and buffer overruns).", style_bullet))

    # 6. Step-by-Step Troubleshooting Workflow
    story.append(Paragraph("6. Step-by-Step Troubleshooting Workflow", style_h1))
    story.append(Paragraph("<b>Step 1: Layer 1 (Physical & Optical Link Verification)</b><br/>Verify physical SFP/QSFP transceiver link status. Inspect digital optical monitoring (DOM) levels using <code>show interface transceiver detail</code>. Optical receive power must register between -3 dBm and -12 dBm. Values below -15 dBm indicate fiber bend or optical optic degradation.", style_body))
    story.append(Paragraph("<b>Step 2: Layer 2 (Data Link, VLAN & Spanning Tree Verification)</b><br/>Verify access and trunk port states. Check for BPDU Guard err-disabled states with <code>show interface status err-disabled</code>. Inspect spanning-tree root bridge continuity with <code>show spanning-tree vlan &lt;vlan_id&gt;</code> to confirm no rogue switch has seized root bridge status.", style_body))
    story.append(Paragraph("<b>Step 3: Layer 3 (IP Routing & Adjacency Triage)</b><br/>Check dynamic routing state: <code>show ip bgp summary</code> or <code>show ip ospf neighbor</code>. If BGP is in Active or Idle state, test TCP port 179 connectivity: <code>nc -zv -w 2 &lt;peer_ip&gt; 179</code>. Confirm MTU matches on both ends of the link with do-not-fragment ping: <code>ping &lt;target_ip&gt; df-bit size 1500</code>.", style_body))
    story.append(Paragraph("<b>Step 4: Layer 4–7 (Firewall Policy, NAT & Service Inspection)</b><br/>Review stateful firewall session tables: <code>show running resource-monitor</code> on Palo Alto firewalls to detect session capacity exhaustion. Inspect drop counters: <code>show counter global filter delta yes</code>. Verify DHCP server scope capacity and DNS resolution responsiveness.", style_body))

    # 7. Common Network Problems and Documented Resolutions Table
    story.append(Spacer(1, 6))
    story.append(Paragraph("7. Common Network Incidents & Documented Resolutions", style_h1))
    
    prob_data = [
        [
            Paragraph("Symptom / Error Code", style_th),
            Paragraph("Root Cause Identification", style_th),
            Paragraph("Verified Corrective Resolution Protocol", style_th)
        ],
        [
            Paragraph("Port in err-disabled state (BPDUGUARD)", style_td),
            Paragraph("Unauthorized unmanaged switch or bridge device connected to edge access port", style_td),
            Paragraph("Disconnect unauthorized equipment from wall jack. Verify port security. Re-enable port: <code>conf t &gt; interface &lt;id&gt; &gt; shutdown &gt; no shutdown</code>.", style_td)
        ],
        [
            Paragraph("High packet loss over trunk uplink with CRC errors", style_td),
            Paragraph("Dirty fiber optic connector, bent patch cable, or failing SFP+ transceiver", style_td),
            Paragraph("Clean LC fiber ferrule using one-click optical cleaner. If optical Rx power remains below -14 dBm, swap SFP module and replace duplex fiber patch cable.", style_td)
        ],
        [
            Paragraph("TCP connection timeouts / SSL handshake hang", style_td),
            Paragraph("MTU path mismatch causing packet fragmentation drops (DF bit set)", style_td),
            Paragraph("Normalize MTU to 1500 bytes (or 9216 for Jumbo fabric). On edge firewalls, enable TCP MSS adjustment: <code>ip tcp adjust-mss 1360</code>.", style_td)
        ],
        [
            Paragraph("Client unable to acquire IP address on WiFi", style_td),
            Paragraph("DHCP scope pool exhaustion (100% utilization in subnet pool)", style_td),
            Paragraph("Execute <code>clear ip dhcp binding *</code> on expired leases. Reduce DHCP lease time from 24h to 2h in high-density areas. Expand subnet mask if sustained.", style_td)
        ],
        [
            Paragraph("BGP neighbor flapping or stuck in Connect state", style_td),
            Paragraph("MD5 authentication hash mismatch or ACL blocking TCP port 179", style_td),
            Paragraph("Verify MD5 password string matches peer config. Ensure outbound access-list permits <code>tcp any any eq 179</code>. Check route-map permit statements.", style_td)
        ]
    ]
    prob_table = Table(prob_data, colWidths=[130, 130, 244])
    prob_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_subtle]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(prob_table)

    # 8. Escalation Procedure
    story.append(Spacer(1, 8))
    story.append(Paragraph("8. Incident Escalation Protocol", style_h1))
    story.append(Paragraph(
        "Network incidents must be escalated promptly to prevent SLA breaches according to the following time thresholds:",
        style_body
    ))
    story.append(Paragraph("• <b>Tier-1 to Tier-2 Escalation:</b> If root cause cannot be isolated within 20 minutes for P1/P2 incidents (or within 45 minutes for P3), NOC Tier-1 must page the on-call Tier-2 Network Engineer and attach all collected diagnostic outputs.", style_bullet))
    story.append(Paragraph("• <b>Tier-2 to Tier-3 / Incident Commander:</b> If core datacenter connectivity loss persists past 30 minutes, escalate to Lead Network Architect and declare an official Sev-1 Major Incident. Convene the emergency bridge on Microsoft Teams / Slack.", style_bullet))
    story.append(Paragraph("• <b>Hardware / Firmware Vendor TAC Escalation:</b> If telemetry suggests ASIC microcode hang, kernel panic, or hardware fabric failure, open a Sev-1 TAC case with Cisco/Arista/Palo Alto within 45 minutes of incident declaration. Upload <code>show tech-support</code> archive immediately.", style_bullet))

    # 9. Incident Reporting and Communication
    story.append(Paragraph("9. Incident Reporting & Stakeholder Communications", style_h1))
    story.append(Paragraph(
        "During active P1/P2 incidents, the Incident Commander must broadcast status bulletins every 30 minutes via the corporate "
        "status page and to the #net-incident-updates Slack channel. Bulletins must state: current operational impact, affected services, "
        "investigation steps underway, estimated time to restore (ETR), and next planned update window.",
        style_body
    ))

    # 10. Resolution Verification Workflow
    story.append(Paragraph("10. Resolution Verification Workflow", style_h1))
    story.append(Paragraph(
        "A network incident is never closed based on assumption. Complete the following mandatory verification steps before closing:",
        style_body
    ))
    story.append(Paragraph("• <b>Step 1 (Ping Sweep & Latency Audit):</b> Execute 100 continuous ICMP echo probes to affected gateways. Packet loss must be exactly 0.0%, and round-trip jitter must not exceed 4.0 ms.", style_bullet))
    story.append(Paragraph("• <b>Step 2 (Application Service Probe):</b> Execute HTTP synthetic transaction check: <code>curl -Iv -k --connect-timeout 5 https://app.internal.domain/health</code>. Response must return HTTP 200 OK within 500ms.", style_bullet))
    story.append(Paragraph("• <b>Step 3 (Error Counter Freeze Verification):</b> Run <code>clear counters &lt;interface&gt;</code> and observe for 15 minutes. Input errors, CRC errors, and packet drops must remain zero.", style_bullet))
    story.append(Paragraph("• <b>Step 4 (Routing Adjacency Stability):</b> Verify BGP uptime exceeds 15 minutes without flapping, and OSPF neighbors remain in FULL state.", style_bullet))

    # 11. Documentation & Approvals
    story.append(Paragraph("11. Documentation & Post-Incident Review (PIR)", style_h1))
    story.append(Paragraph(
        "All P1 and P2 network incidents require a completed Post-Incident Review (PIR) document submitted within 48 hours. "
        "The PIR must document: exact timeline of events, root cause analysis (5 Whys), preventative architectural remedies, and updated monitoring alerts. "
        "PIRs must be approved by the Network Engineering Director and IT VP.",
        style_body
    ))

    story.append(Spacer(1, 6))
    story.append(Paragraph("12. Document Approvals & Revision History", style_h1))
    appr_data = [
        [Paragraph("Role / Authority", style_th), Paragraph("Name & Title", style_th), Paragraph("Signature / Verification", style_th), Paragraph("Date", style_th)],
        [Paragraph("Lead Author", style_td), Paragraph("Elena Rostova, Principal Network Engineer", style_td), Paragraph("E. Rostova (Verified)", style_td), Paragraph("2026-05-10", style_td)],
        [Paragraph("Security Director", style_td), Paragraph("Michael Zhang, Chief Security Officer", style_td), Paragraph("M. Zhang (Verified)", style_td), Paragraph("2026-05-12", style_td)],
        [Paragraph("VP IT Infrastructure", style_td), Paragraph("Arthur Pendelton, VP Enterprise Infrastructure", style_td), Paragraph("A. Pendelton (Approved)", style_td), Paragraph("2026-05-14", style_td)]
    ]
    appr_table = Table(appr_data, colWidths=[120, 150, 150, 84])
    appr_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_subtle]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(appr_table)

    story.append(Spacer(1, 6))
    rev_data = [
        [Paragraph("Version", style_th), Paragraph("Release Date", style_th), Paragraph("Description of Modifications", style_th), Paragraph("Approved By", style_th)],
        [Paragraph("1.0", style_td), Paragraph("2024-05-01", style_td), Paragraph("Initial network incident response procedure baseline", style_td), Paragraph("A. Pendelton", style_td)],
        [Paragraph("2.0", style_td), Paragraph("2025-06-15", style_td), Paragraph("Added SD-WAN branch gateway and BGP multi-homing troubleshooting", style_td), Paragraph("E. Rostova", style_td)],
        [Paragraph("3.0", style_td), Paragraph("2026-05-15", style_td), Paragraph("Added 802.11ax WiFi scope exhaustion and next-gen firewall table metrics", style_td), Paragraph("M. Zhang", style_td)]
    ]
    rev_table = Table(rev_data, colWidths=[50, 80, 290, 84])
    rev_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_subtle]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(rev_table)

    def on_page(canvas_obj, document_obj):
        canvas_obj.doc_header_title = "STANDARD OPERATING PROCEDURE: IT NETWORK INCIDENT RESOLUTION"
        canvas_obj.doc_id_label = "SOP-IT-002 | Rev 3.0"

    doc.build(story, canvasmaker=NumberedCanvas, onFirstPage=on_page, onLaterPages=on_page)
    print(f"Built {pdf_path}")


if __name__ == "__main__":
    build_sop_mnt_001()
    build_sop_it_002()
    print("Both PDF documents successfully generated in", OUTPUT_DIR)
