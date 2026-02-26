# Custom Agents for AI Recommendation System

## Available Agents

### ai-review-analyzer

**Purpose**: Comprehensive product review analysis with fake review detection and confidence scoring.

**When to Use**:
- Analyzing product reviews for authenticity
- Validating AI recommendation engine logic
- Investigating suspicious review patterns
- Generating detailed recommendation reports
- Auditing review analysis completeness

**Key Features**:
- ✅ Analyzes 100% of available reviews (never partial)
- ✅ Fake review detection with pattern recognition
- ✅ Confidence score calculation (30-99%)
- ✅ Multi-factor analysis (trustworthiness, consistency, quality)
- ✅ Structured output with warnings and reasoning
- ✅ Transparency in limitations and data quality

**How to Invoke**:
```javascript
// In your code or testing
invokeSubAgent('ai-review-analyzer', {
  task: 'Analyze the review dataset for [product name] and provide a recommendation with confidence score'
});
```

**Example Tasks**:
- "Analyze all reviews in utils/ai-recommendation-engine.js and verify the fake review detection algorithm is comprehensive"
- "Review the test scenarios in TEST_AI_RECOMMENDATION.md and identify any gaps in review analysis coverage"
- "Examine the extractReviews() function and ensure it captures all review data"
- "Validate that confidence scores are calculated correctly based on the specification"

**Output Format**:
The agent provides structured analysis including:
- Recommendation (BUY/WAIT/AVOID)
- Confidence percentage
- Complete review statistics
- Trustworthiness, consistency, and quality scores
- Suspicious patterns detected
- 5-part reasoning explanation
- Warnings for high-risk situations

**Model**: claude-3-5-sonnet-20241022 (optimized for thorough analysis)

**Tools**: Read and Write access (for analyzing code and creating reports)

---

## Creating Additional Agents

To create more custom agents for this workspace:

1. Create a new `.md` file in `.kiro/agents/`
2. Use the YAML frontmatter format:
```yaml
---
name: agent-id-kebab-case
description: Clear description of purpose and when to use
tools: ["read", "write", "shell"]  # Use tags, not specific tool names
model: optional-model-override
---
```
3. Define the agent's behavior, responsibilities, and output format in the markdown content
4. Restart Kiro or reload the workspace to register the new agent

**Available Tool Tags**:
- `read`: File reading, search, diagnostics
- `write`: File creation and modification
- `shell`: Command execution
- `web`: Web search and fetching
- `spec`: Spec workflow tools
- `@builtin`: All built-in tools
- `@mcp`: MCP tools (if configured)
- `@powers`: Kiro Powers tools

---

## Best Practices

1. **Single Responsibility**: Each agent should have one clear purpose
2. **Minimal Tools**: Only grant access to tools the agent needs
3. **Clear Instructions**: Provide explicit behavior guidelines
4. **Structured Output**: Define consistent output formats
5. **Quality Checks**: Include verification checklists in agent prompts
6. **Transparency**: Instruct agents to acknowledge limitations

---

## Testing Your Agents

After creating an agent, test it with:
1. Simple tasks to verify basic functionality
2. Edge cases to check error handling
3. Complex scenarios to validate thoroughness
4. Different input types to ensure flexibility

Monitor for:
- Consistent output format
- Appropriate tool usage
- Accurate analysis
- Clear reasoning
- Proper error handling

---

## Support

For questions about custom agents:
- Review the main Kiro documentation
- Check agent-specific instructions in each `.md` file
- Test agents incrementally with simple tasks first
- Verify YAML frontmatter is properly formatted
