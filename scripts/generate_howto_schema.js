const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '../blog');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already has HowTo schema
    if (content.includes('"@type": "HowTo"')) {
        console.log(`Skipping (already has HowTo schema): ${path.basename(filePath)}`);
        return;
    }

    // Look for steps in the HTML (e.g. <h3>Step 1: Upload Your Video</h3>)
    const stepRegex = /<h[23]>(Step \d+.*?|.*?Step \d+.*?)<\/h[23]>\s*(?:<p>|<ul.*?>|<ol.*?>)([\s\S]*?)(?:<\/p>|<\/ul>|<\/ol>)/gi;
    
    let steps = [];
    let match;

    while ((match = stepRegex.exec(content)) !== null) {
        // match[1] is the heading text, match[2] is the paragraph/list text
        let stepName = match[1].replace(/<[^>]+>/g, '').trim();
        let stepText = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        
        // Truncate text if too long
        if (stepText.length > 250) {
            stepText = stepText.substring(0, 247) + '...';
        }

        steps.push({
            "@type": "HowToStep",
            "name": stepName,
            "text": stepText
        });
    }

    if (steps.length > 0) {
        // Extract title for the HowTo schema name
        const titleMatch = content.match(/<title>(.*?)<\/title>/);
        const name = titleMatch ? titleMatch[1].split('|')[0].trim() : "How to Tutorial";

        const schema = {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": name,
            "step": steps
        };

        const scriptTag = `\n    <script type="application/ld+json">\n    ${JSON.stringify(schema, null, 8).replace(/\n/g, '\n    ')}\n    </script>\n`;

        // Insert before </head>
        content = content.replace('</head>', `${scriptTag}</head>`);
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Successfully added HowTo schema with ${steps.length} steps to: ${path.basename(filePath)}`);
    } else {
        console.log(`No steps found in: ${path.basename(filePath)}`);
    }
}

function scanDirectory() {
    const files = fs.readdirSync(blogDir);
    files.forEach(file => {
        if (file.endsWith('.html')) {
            processFile(path.join(blogDir, file));
        }
    });
}

scanDirectory();
