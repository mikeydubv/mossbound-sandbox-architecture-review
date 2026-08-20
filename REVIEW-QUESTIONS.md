# Independent Architecture Review

Please be adversarial and opinionated. Optimize for a bold working proof-of-concept, not backward compatibility.

1. Is this architecture sufficient for a reliable vertical slice, or are foundational systems missing?
2. Which parts should be rebuilt cleanly instead of migrated from `scene-v20.js`?
3. What hidden coupling and regression points are highest risk?
4. Are transactions, undo/redo, serialization, IDs, and rollback correct?
5. What is the minimum complete product architecture before visual polish?
6. What should be implemented first, second, and third?
7. Which automated tests catch likely browser regressions?
8. What should be explicitly deleted or abandoned?
9. What makes the demo compelling within 30 seconds?
10. Give a concrete folder/module structure and migration plan.

Do not simply approve the direction. Identify anything architecturally impressive that would fail during actual browser interaction.
