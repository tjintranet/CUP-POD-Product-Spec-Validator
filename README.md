# CUP XML Validator

A web-based application for validating Cambridge University Press (CUP) book specification XML files against manufacturing requirements.

## Features

-   **Multi-file upload**: Drag & drop or browse multiple XML files
-   **Real-time validation**: Instant validation results with visual indicators
-   **Comprehensive checks**: 8 validation rules covering all specification requirements
-   **Summary reports**: Download validation results as text reports
-   **Copy to clipboard**: Quick copy of individual validation results with visual feedback
-   **Filter results**: Toggle to show only failed validations for quick issue identification
-   **Compact interface**: Clean, easy-to-read results display

## Validation Rules

### Required Fields

-   ISBN
-   Trim Height
-   Trim Width
-   Extent
-   Paper
-   Colour
-   Quality (Route)
-   Binding Style

### Valid Values

**Binding Style:**

-   Cased
-   Limp

**Paper Types:**

-   CUP MunkenPure 80 gsm
-   Navigator 80 gsm
-   Clairjet 90 gsm
-   Magno Matt 90 gsm

**Colour:**

-   Mono
-   Colour

**Quality/Route:**

-   Standard
-   Premium

**Trim Sizes:**

-   140x216mm
-   152x229mm
-   156x234mm
-   170x244mm
-   189x246mm
-   178x254mm
-   203x254mm
-   216x280mm

### Paper Compatibility Rules

Paper Type

Allowed Colour

Allowed Route

CUP MunkenPure 80 gsm

Mono only

Standard only

Navigator 80 gsm

Mono only

Standard only

Clairjet 90 gsm

Colour only

Standard only

Magno Matt 90 gsm

Mono or Colour

Premium only

## Installation

1.  Download all files to a single directory:
    
    -   `cup-index.html`
    -   `cup-config.js`
    -   `cup-validator.js`
    -   `cup-multi-validator.js`
    -   `cup-style.css`
2.  Open `cup-index.html` in a modern web browser
    

No server or build process required - runs entirely in the browser.

## Usage

1.  **Upload Files**
    
    -   Drag and drop XML files onto the upload area, or
    -   Click "Browse Files" to select files from your computer
2.  **View Results**
    
    -   Each file displays as a card showing pass/fail status
    -   Green border = all validations passed
    -   Red border = one or more validations failed
    -   Detailed validation messages appear in each card
3.  **Filter Results**
    
    -   Use the "Show failed only" toggle in the results summary to filter and display only files with validation failures
    -   The "Showing" count updates dynamically to reflect filtered results
4.  **Export Results**
    
    -   Click "Download Summary" to export all results as a text file
    -   Click the clipboard icon on individual cards to copy results to clipboard
5.  **Clear Results**
    
    -   Click "Clear Results" to remove all files and start over

## XML File Structure

Expected XML structure:

```xml
<?xml version="1.0"?><record>  <isbn>9780521186230</isbn>  <title>Book Title</title>  <trim_height>254</trim_height>  <trim_width>203</trim_width>  <extent>656</extent>  <paper>Navigator 80 gsm</paper>  <colour>Mono</colour>  <quality>Standard</quality>  <binding_style>Limp</binding_style>  <!-- other fields... --></record>
```

## Browser Compatibility

-   Chrome/Edge (recommended)
-   Firefox
-   Safari
-   Any modern browser with JavaScript enabled

## Technical Details

-   **No dependencies**: Pure JavaScript, HTML5, CSS3
-   **Bootstrap 5.3.2**: UI framework (loaded via CDN)
-   **Bootstrap Icons**: Icon library (loaded via CDN)
-   **Client-side only**: All processing happens in the browser

## File Descriptions

-   `cup-index.html` - Main HTML interface
-   `cup-config.js` - Validation rules configuration
-   `cup-validator.js` - Validation logic (class-based)
-   `cup-multi-validator.js` - Application controller and UI handling
-   `cup-style.css` - Custom styling

## Support

For issues or questions, please contact your system administrator.

---

**Version:** 1.1  
**Last Updated:** January 2026