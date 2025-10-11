# Claude Code Assistant Rules for LineBasis

**Purpose:** Ensure Claude Code automatically follows all project standards, leaving humans to focus purely on vision and direction.

---

## 🎯 Core Philosophy

**Human Role:** Vision, direction, strategic decisions
**Claude Role:** Implementation, quality control, best practices enforcement

---

## 🚦 MANDATORY Pre-Flight Checklist

**Before starting ANY coding session, Claude MUST:**

### 1. **Check Git Status**
```bash
git status
git branch --show-current
git log --oneline -3
```

**Questions to answer:**
- Am I on the right branch?
- Is the branch name semantic and correct?
- Is main up to date?

**Auto-fix if needed:**
- If on `main` → Ask user for feature name, create `feat/name`
- If branch name is wrong → Suggest creating correct branch
- If behind main → Offer to rebase

### 2. **Verify Branch Naming**

**Format:** `<type>/<description>`

**Valid types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

**If invalid:**
```bash
Current branch: "my-changes"
❌ Invalid branch name

Suggested action:
git checkout -b feat/descriptive-name
git cherry-pick <commits>
git branch -D my-changes
```

### 3. **Check for Uncommitted Changes**

**If uncommitted changes exist:**
- **Option A:** Commit them first (ask user for intent)
- **Option B:** Stash them
- **Option C:** Create WIP commit

**Never** start new work with dirty working tree.

---

## 📝 Commit Message Automation

### **ALWAYS Use Conventional Commits**

**Format:** `<type>(<scope>): <description>`

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

**Claude MUST:**
1. Analyze the changes made
2. Determine the correct type
3. Write clear, imperative description
4. Include body for complex changes
5. Add footer with references

**Examples:**

```bash
# Simple feature
feat: add plugin system core architecture

# With scope
feat(blog): extract blog to plugin

# With body
feat: implement schema composition

- Auto-discovers active plugins
- Merges core + plugin schemas
- Handles model relations
```

**Never:**
- ❌ `update code`
- ❌ `fix stuff`
- ❌ `WIP`
- ❌ `changes`

---

## 🌳 Branch Management Protocol

### **Starting New Work**

**Claude MUST always:**

1. **Check current branch:**
   ```bash
   git branch --show-current
   ```

2. **If not on main:**
   - Ask: "Should we start from main or continue here?"
   - If start from main:
     ```bash
     git checkout main
     git pull origin main
     git checkout -b feat/new-feature
     ```

3. **If on main:**
   - Ask: "What feature are we building?"
   - Create: `git checkout -b feat/user-answer`

4. **Verify branch name is semantic:**
   - Does it describe what we're building?
   - Does it follow `<type>/<description>` format?
   - Is it concise but clear?

### **Before Creating PR**

**Claude MUST:**

1. **Check commit history:**
   ```bash
   git log --oneline
   ```

2. **If messy (>10 commits or unclear messages):**
   - Offer to squash
   - Suggest logical grouping
   - Rewrite commit messages

3. **Rebase on main:**
   ```bash
   git checkout main && git pull origin main
   git checkout feat/branch
   git rebase main
   ```

4. **Run pre-PR checks:**
   ```bash
   npm run test
   npm run check
   npm run build
   ```

---

## 📦 Atomic Commits Strategy

### **Claude MUST Break Work Into:**

**1. Small, Focused Commits**
- Each commit = one logical change
- Can be understood in isolation
- Can be reverted safely

**2. Commit Frequency**
- After completing a logical unit
- Before switching tasks
- When tests pass
- At natural breakpoints

**3. Commit Grouping**
- Related changes together
- Dependencies in correct order
- Tests with implementation

**Example Sequence:**

```bash
# Good sequence
git commit -m "feat: add plugin type system"
git commit -m "feat: implement plugin registry"
git commit -m "test: add registry unit tests"
git commit -m "docs: document plugin architecture"

# Bad sequence
git commit -m "wip"
git commit -m "more changes"
git commit -m "fix"
git commit -m "fix fix"
```

---

## 🧪 Testing Requirements

### **Claude MUST:**

**Before Every Commit:**
1. Ensure existing tests pass
2. Add tests for new features
3. Update tests for changes

**Before Every Push:**
1. Run full test suite
2. Check test coverage
3. Verify build works

**Test Coverage Rules:**
- New features: Must have tests
- Bug fixes: Must have regression test
- Refactors: Tests must still pass

---

## 📚 Documentation Protocol

### **Claude MUST Document:**

**1. During Development:**
- Complex logic → Code comments
- New features → Update README
- API changes → Update API docs
- Breaking changes → Migration guide

**2. After Feature Complete:**
- Create/update relevant docs
- Add examples
- Update changelog

**3. Documentation Checklist:**
- [ ] Code comments for complex parts
- [ ] README updated
- [ ] API docs updated
- [ ] Examples added
- [ ] Migration guide (if breaking)

---

## 🔄 Workflow Automation

### **Session Start Protocol**

**Claude automatically:**

1. **Greet and check status:**
   ```
   🤖 Claude Code starting session...

   Current branch: feat/plugin-architecture
   Status: 3 uncommitted changes
   Last commit: 2 hours ago

   Options:
   1. Commit existing changes
   2. Continue working
   3. Start new feature

   What would you like to do?
   ```

2. **Offer context:**
   - What was I working on last?
   - What's next in the plan?
   - Any blockers to address?

### **Mid-Session Checkpoints**

**Every 30 minutes or major milestone, Claude:**

1. **Suggest commit:**
   ```
   💡 Checkpoint reached!

   Changes made:
   - Added 3 new files
   - Modified 5 existing files
   - 200 lines added

   Suggested commit:
   feat: implement plugin loading system

   Commit now? (y/n)
   ```

2. **Run tests:**
   ```bash
   npm run test
   ```

3. **Update todos:**
   - Mark completed items
   - Add new discovered tasks

### **Session End Protocol**

**Before ending, Claude:**

1. **Ensure clean state:**
   - All changes committed OR
   - Changes stashed with clear message OR
   - User explicitly wants dirty state

2. **Summary:**
   ```
   ✅ Session complete!

   Commits made: 3
   Files changed: 12
   Lines added: 450
   Tests: All passing ✓

   Next steps:
   1. Review changes
   2. Create PR when ready
   3. Continue feature development
   ```

---

## 🚨 Error Prevention

### **Claude MUST Check Before:**

**1. Making Large Changes:**
- Confirm scope with user
- Break into smaller tasks
- Create issue/plan if complex

**2. Modifying Core Files:**
- Explain impact
- Suggest tests
- Warn about breaking changes

**3. Deleting Code:**
- Verify it's actually unused
- Check for references
- Suggest deprecation first

**4. Force Pushing:**
- Only on feature branches
- Use `--force-with-lease`
- Warn about collaboration

---

## 📊 Quality Gates

### **Before Commit:**
- [ ] Tests pass
- [ ] No console.log
- [ ] No `any` types
- [ ] Code formatted
- [ ] No linter errors

### **Before Push:**
- [ ] All commits have good messages
- [ ] Branch name is semantic
- [ ] Production build works
- [ ] Documentation updated

### **Before PR:**
- [ ] Clean commit history
- [ ] Rebased on main
- [ ] All tests pass
- [ ] Self-reviewed
- [ ] Description written

---

## 🎨 Code Style Enforcement

**Claude MUST:**

### **TypeScript:**
```typescript
// Always type everything
function getUser(id: string): User | null  ✅
function getUser(id): any                  ❌

// Prefer const
const items = []   ✅
let items = []     ❌

// Descriptive names
const pluginRegistry = {}  ✅
const pr = {}              ❌
```

### **File Organization:**
```
src/
├── lib/
│   ├── components/     # Reusable UI
│   ├── core/          # Core logic
│   ├── server/        # Server-side
│   └── utils/         # Helpers
├── routes/            # SvelteKit routes
└── tests/             # Tests
```

### **Naming Conventions:**
- Files: `kebab-case.ts`
- Components: `PascalCase.svelte`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

---

## 🤖 AI-Specific Rules

### **Claude Should:**

**1. Be Proactive:**
- Suggest improvements
- Identify patterns
- Recommend refactors
- Spot issues early

**2. Communicate Clearly:**
- Explain what you're doing
- Show commit messages before committing
- Summarize changes
- Provide context

**3. Ask When Uncertain:**
- Feature scope unclear → Ask
- Multiple approaches possible → Present options
- Breaking changes needed → Discuss impact

**4. Use TodoWrite Effectively:**
- Track all major tasks
- Update frequently
- Mark completion immediately
- Clean up when done

**5. Maintain Context:**
- Remember conversation history
- Reference previous decisions
- Build on past work
- Don't repeat mistakes

---

## 📋 Decision Framework

### **When to Ask User:**

**Strategic Decisions:**
- Feature scope and direction
- Architecture choices
- Breaking changes
- API design

**Technical Decisions:**
- Implementation approach (if multiple valid options)
- Technology choices
- Performance tradeoffs

### **When to Decide Automatically:**

**Tactical Decisions:**
- Variable names
- File organization
- Code style
- Commit messages
- Test structure

**Quality Decisions:**
- Adding tests
- Improving documentation
- Refactoring for clarity
- Fixing lint errors

---

## 🔧 Automation Checklist

### **Every Coding Session:**

```markdown
🤖 Claude Code Session Checklist

Pre-Flight:
- [ ] Check git status
- [ ] Verify branch name
- [ ] Ensure clean working tree
- [ ] Pull latest main
- [ ] Review last session notes

During Work:
- [ ] Commit frequently (every logical unit)
- [ ] Write good commit messages
- [ ] Run tests regularly
- [ ] Update documentation
- [ ] Use TodoWrite for tracking

Before Committing:
- [ ] Tests pass
- [ ] No debug code
- [ ] Code formatted
- [ ] Comments added
- [ ] Types are proper

Before Pushing:
- [ ] Clean commit history
- [ ] All tests pass
- [ ] Build works
- [ ] Documentation complete

Before PR:
- [ ] Rebased on main
- [ ] Self-reviewed
- [ ] PR description written
- [ ] Breaking changes documented
```

---

## 💡 Human Override Protocol

**User can always:**

1. **Override any rule** with explicit instruction
2. **Skip quality checks** if needed (with `--no-verify`)
3. **Change direction** mid-session
4. **Request different approach**

**Claude should:**
- Acknowledge the override
- Explain implications if significant
- Proceed with user's choice
- Don't argue or resist

---

## 📈 Continuous Improvement

**Claude should learn:**

1. **Project patterns:**
   - Naming conventions used
   - Code organization preferences
   - Commit message style

2. **User preferences:**
   - Verbosity level
   - Explanation depth
   - Proactivity level

3. **Common tasks:**
   - Shortcuts and aliases
   - Frequent operations
   - Standard workflows

---

## 🎯 Success Metrics

**Good Session:**
- ✅ All commits follow conventions
- ✅ Branch name is semantic
- ✅ Tests are passing
- ✅ Documentation is updated
- ✅ Clean git history
- ✅ User focused on vision, not mechanics

**Bad Session:**
- ❌ Messy commit history
- ❌ Wrong branch name
- ❌ Broken tests
- ❌ No documentation
- ❌ User fixing git issues

---

## 🚀 Quick Reference

**Before ANY commit:**
```bash
git status                    # Check state
npm run test                  # Tests pass?
git add .                     # Stage changes
git commit -m "type: desc"    # Conventional commit
```

**Before ANY push:**
```bash
git log --oneline            # History clean?
npm run check                # Linting pass?
npm run build                # Build works?
git push origin branch       # Push!
```

**Starting new feature:**
```bash
git checkout main            # Start from main
git pull origin main         # Get latest
git checkout -b feat/name    # Create feature branch
```

---

**Remember: Humans think, Claude executes. Keep it that way.** 🤖✨
