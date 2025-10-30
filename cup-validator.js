class CUPValidator {
    constructor() {
        this.validationSteps = [
            this.validateRequiredFields,
            this.validateBinding,
            this.validatePaper,
            this.validateColour,
            this.validateRoute,
            this.validateTrimSize,
            this.validateColourPaperCompatibility,
            this.validateRoutePaperCompatibility
        ];
    }

    validate(xmlDoc) {
        const results = [];
        
        const context = {
            isbn: xmlDoc.querySelector('isbn')?.textContent?.trim(),
            title: xmlDoc.querySelector('title')?.textContent?.trim(),
            trim_height: xmlDoc.querySelector('trim_height')?.textContent?.trim(),
            trim_width: xmlDoc.querySelector('trim_width')?.textContent?.trim(),
            extent: xmlDoc.querySelector('extent')?.textContent?.trim(),
            paper: xmlDoc.querySelector('paper')?.textContent?.trim(),
            colour: xmlDoc.querySelector('colour')?.textContent?.trim(),
            quality: xmlDoc.querySelector('quality')?.textContent?.trim(),
            binding_style: xmlDoc.querySelector('binding_style')?.textContent?.trim(),
            results: results
        };

        // Run all validation steps
        for (const step of this.validationSteps) {
            step.call(this, context);
        }

        return results;
    }

    addResult(results, test, result, message) {
        results.push({ test, result, message });
    }

    validateRequiredFields(context) {
        const { isbn, trim_height, trim_width, extent, paper, colour, quality, binding_style, results } = context;
        
        const requiredFields = {
            'ISBN': isbn,
            'Trim Height': trim_height,
            'Trim Width': trim_width,
            'Extent': extent,
            'Paper': paper,
            'Colour': colour,
            'Quality': quality,
            'Binding Style': binding_style
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value || value.trim() === '')
            .map(([field]) => field);

        const allFieldsPresent = missingFields.length === 0;

        this.addResult(
            results,
            'Required Fields',
            allFieldsPresent,
            allFieldsPresent 
                ? 'All required fields are present and have values'
                : `Missing or empty fields: ${missingFields.join(', ')}`
        );
    }

    validateBinding(context) {
        const { binding_style, results } = context;
        const isValid = CONFIG.VALID_BINDINGS.has(binding_style);
        
        this.addResult(
            results,
            'Binding Style',
            isValid,
            isValid
                ? `Valid binding: ${binding_style}`
                : `Invalid binding: '${binding_style}' (must be Cased or Limp)`
        );
    }

    validatePaper(context) {
        const { paper, results } = context;
        const isValid = CONFIG.VALID_PAPERS.has(paper);
        
        this.addResult(
            results,
            'Paper Type',
            isValid,
            isValid
                ? `Valid paper: ${paper}`
                : `Invalid paper: '${paper}' (must be CUP MunkenPure 80 gsm, Navigator 80 gsm, Clairjet 90 gsm, or Magno Matt 90 gsm)`
        );
    }

    validateColour(context) {
        const { colour, results } = context;
        const isValid = CONFIG.VALID_COLOURS.has(colour);
        
        this.addResult(
            results,
            'Colour',
            isValid,
            isValid
                ? `Valid colour: ${colour}`
                : `Invalid colour: '${colour}' (must be Mono or Colour)`
        );
    }

    validateRoute(context) {
        const { quality, results } = context;
        const isValid = CONFIG.VALID_ROUTES.has(quality);
        
        this.addResult(
            results,
            'Quality/Route',
            isValid,
            isValid
                ? `Valid route: ${quality}`
                : `Invalid route: '${quality}' (must be Standard or Premium)`
        );
    }

    validateTrimSize(context) {
        const { trim_width, trim_height, results } = context;
        
        const width = parseFloat(trim_width);
        const height = parseFloat(trim_height);
        
        // Check for invalid dimensions
        if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
            this.addResult(
                results,
                'Trim Size',
                false,
                `Invalid dimensions: ${trim_width}x${trim_height}mm (must be positive numbers)`
            );
            return;
        }
        
        const trimSize = `${Math.round(width)}x${Math.round(height)}`;
        const isValid = CONFIG.VALID_TRIM_SIZES.has(trimSize);
        
        this.addResult(
            results,
            'Trim Size',
            isValid,
            isValid
                ? `Valid trim size: ${trimSize}mm`
                : `Invalid trim size: ${trimSize}mm (must be one of: 140x216, 152x229, 156x234, 170x244, 189x246, 178x254, 203x254, 216x280)`
        );
    }

    validateColourPaperCompatibility(context) {
        const { paper, colour, results } = context;
        
        // Only validate if both paper and colour are valid
        if (!CONFIG.VALID_PAPERS.has(paper) || !CONFIG.VALID_COLOURS.has(colour)) {
            return;
        }
        
        const compatibility = CONFIG.PAPER_COMPATIBILITY[paper];
        const isValid = compatibility.allowedColours.has(colour);
        
        if (!isValid) {
            const allowedColours = Array.from(compatibility.allowedColours).join(', ');
            this.addResult(
                results,
                'Colour/Paper Compatibility',
                false,
                `Colour '${colour}' is not compatible with ${paper} (allowed: ${allowedColours})`
            );
        } else {
            this.addResult(
                results,
                'Colour/Paper Compatibility',
                true,
                `Colour '${colour}' is compatible with ${paper}`
            );
        }
    }

    validateRoutePaperCompatibility(context) {
        const { paper, quality, results } = context;
        
        // Only validate if both paper and route are valid
        if (!CONFIG.VALID_PAPERS.has(paper) || !CONFIG.VALID_ROUTES.has(quality)) {
            return;
        }
        
        const compatibility = CONFIG.PAPER_COMPATIBILITY[paper];
        const isValid = compatibility.allowedRoutes.has(quality);
        
        if (!isValid) {
            const allowedRoutes = Array.from(compatibility.allowedRoutes).join(', ');
            this.addResult(
                results,
                'Route/Paper Compatibility',
                false,
                `Route '${quality}' is not compatible with ${paper} (allowed: ${allowedRoutes})`
            );
        } else {
            this.addResult(
                results,
                'Route/Paper Compatibility',
                true,
                `Route '${quality}' is compatible with ${paper}`
            );
        }
    }
}
