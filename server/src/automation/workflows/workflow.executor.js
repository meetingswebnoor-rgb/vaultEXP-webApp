const actionHandler = require('../handlers/action.handler');

class WorkflowExecutor {
  /**
   * Executes a sequence of defined steps for a workflow.
   */
  async execute(workflow, payload) {
    console.log(`[WorkflowExecutor] Executing workflow: ${workflow.name}`);
    
    // Store context that can be passed from one step to the next
    const context = { ...payload };

    for (const step of workflow.steps) {
      try {
        const compiledPayload = this.compileTemplate(step.payloadTemplate, context);
        const stepResult = await actionHandler.handle(step.type, compiledPayload, context);
        
        // Merge outputs back into context for subsequent steps
        if (stepResult) {
          Object.assign(context, stepResult);
        }
      } catch (err) {
        console.error(`[WorkflowExecutor] Step ${step.type} failed in workflow ${workflow.name}:`, err);
        // Break on failure to prevent cascading errors
        break;
      }
    }
  }

  /**
   * Replaces mustache-like placeholders {{field}} with actual data from context.
   */
  compileTemplate(template, context) {
    if (!template) return {};
    
    const compiled = {};
    for (const [key, value] of Object.entries(template)) {
      if (typeof value === 'string') {
        compiled[key] = value.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
          return this.getNestedProperty(context, path.trim()) || '';
        });
      } else {
        compiled[key] = value;
      }
    }
    return compiled;
  }

  getNestedProperty(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }
}

module.exports = new WorkflowExecutor();
