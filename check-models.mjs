import fs from "fs";

async function findAvailableModels() {
    const envFile = fs.readFileSync(".env", "utf8");
    const apiKeyMatch = envFile.match(/GEMINI_API_KEY="([^"]+)"/);
    const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;

    if (!apiKey) {
        process.stdout.write("NO_API_KEY");
        return;
    }
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        
        if (data.models) {
            const names = data.models.map(m => m.name.replace("models/", ""));
            fs.writeFileSync("available_models.txt", names.join("\n"));
            process.stdout.write("SUCCESS");
        } else {
            process.stdout.write("NO_MODELS_FOUND");
        }
    } catch (e) {
        process.stdout.write("ERROR:" + e.message);
    }
}

findAvailableModels();
