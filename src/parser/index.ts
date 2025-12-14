import * as fs from 'fs';
import MarkdownIt from 'markdown-it';
import { Requirement, AcceptanceCriterion } from '../types';

export class RequirementParser {
    private md: MarkdownIt;

    constructor() {
        this.md = new MarkdownIt();
    }

    public parse(filePath: string): Requirement[] {
        const content = fs.readFileSync(filePath, 'utf-8');
        const tokens = this.md.parse(content, {});
        const requirements: Requirement[] = [];

        let currentReq: Requirement | null = null;
        let currentACs: AcceptanceCriterion[] = [];
        let captureAC = false;

        // Simple state machine for parsing
        // This expects requirements to be under headers like "### Requirement X"

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            // Detect Requirement Header (h3)
            if (token.type === 'heading_open' && token.tag === 'h3') {
                // Save previous req
                if (currentReq) {
                    currentReq.acceptanceCriteria = currentACs;
                    requirements.push(currentReq);
                }

                // Start new req
                const titleToken = tokens[i + 1];
                const title = titleToken.content;
                currentReq = {
                    id: title.replace(/\s+/g, '-').toLowerCase(),
                    title: title,
                    userStory: '',
                    acceptanceCriteria: [],
                    sourceFile: filePath
                };
                currentACs = [];
                captureAC = false;
                continue;
            }

            // Detect User Story (content after "User Story:")
            if (currentReq && token.type === 'inline' && token.content.includes('User Story:')) {
                currentReq.userStory = token.content.replace('**User Story:**', '').trim();
                continue;
            }

            // Detect Acceptance Criteria Header
            if (currentReq && token.type === 'heading_open' && token.tag === 'h4') {
                const nextToken = tokens[i + 1];
                if (nextToken.content.toLowerCase().includes('acceptance criteria')) {
                    captureAC = true;
                }
                continue;
            }

            // Detect Ordered List Items (ACs)
            if (currentReq && captureAC && token.type === 'inline') {
                // Very rough check if it's inside an Ordered List item
                // markdown-it structure is ordered_list_open -> list_item_open -> paragraph_open -> inline -> ...
                // We assume high level traversing for now or just grabbing valid text near AC

                // Better: Check if parent was ordered list. 
                // For simplicity, we assume robust structure in requirements.md
                // If the line starts with a number or is in a list context

                if (token.content.trim().length > 5) { // minimal length
                    currentACs.push({
                        id: `${currentReq.id}-ac-${currentACs.length + 1}`,
                        description: token.content.trim()
                    });
                }
            }
        }

        // Push last req
        if (currentReq) {
            currentReq.acceptanceCriteria = currentACs;
            requirements.push(currentReq);
        }

        return requirements;
    }
}
