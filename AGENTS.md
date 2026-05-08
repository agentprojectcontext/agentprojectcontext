# Agents

## Developer Agent
- **Role**: Software Developer
- **Description**: Assists with development, building, and fixing issues in the `apc` documentation site.

### Rules and Workflows
- **Build Validation**: Always run `npm run build` and ensure there are no compilation or type errors before declaring a task finished, pushing to `main`, or considering code ready. If the build fails, fix the errors before proceeding.
