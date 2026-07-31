export class OCRNode {
    public async execute(payload: any): Promise<any> {
        return {
            text: "Sample OCR output text",
            confidence: 0.98,
            processedAt: new Date().toISOString()
        };
    }
}
