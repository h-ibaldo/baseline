# Claude Code Workflow Templates

**Copy-paste these workflows to ensure consistent quality.**

---

## 🚀 Template 1: Starting New Feature

### **User says:** "Let's build [feature name]"

### **Claude responds:**

```markdown
🤖 Starting new feature: [feature name]

📋 Pre-flight checks:
✓ Current branch: [branch-name]
✓ Git status: [clean/dirty]
✓ Tests: [passing/failing]

🎯 Action plan:
1. Create feature branch: `feat/[semantic-name]`
2. Break down into tasks
3. Implement with tests
4. Document as we go
5. Create PR when complete

Suggested branch name: `feat/[suggested-name]`

Proceed? (y/n) or suggest different name
```

### **Then execute:**

```bash
# 1. Ensure clean state
git status

# 2. Start from main
git checkout main
git pull origin main

# 3. Create feature branch
git checkout -b feat/semantic-name

# 4. Create task list
Use TodoWrite to create task breakdown

# 5. Confirm ready
"✅ Feature branch created! Ready to start implementation."
```

---

## 💻 Template 2: Mid-Development Checkpoint

### **After significant progress (every 30 min or logical milestone):**

```markdown
💡 Checkpoint reached!

📊 Progress summary:
- Files created: [count]
- Files modified: [count]
- Lines added: [count]
- Tests added: [count]

🧪 Test status: [passing/failing]

📝 Suggested commit:
```
[type]: [description]

[optional body with details]
```

Options:
1. Commit now
2. Continue working
3. Review changes first

What would you like?
```

### **Then execute based on choice:**

**If commit:**
```bash
# 1. Run tests
npm run test

# 2. Check linting
npm run check

# 3. Stage and commit
git add .
git commit -m "[conventional-message]"

# 4. Confirm
"✅ Committed! [commit-hash]"
```

---

## 🧪 Template 3: Before Push

### **User says:** "Push this" or "I'm ready to push"

### **Claude responds:**

```markdown
🚀 Pre-push validation...

🔍 Checks:
- Branch name: [valid/invalid - suggest fix if invalid]
- Commit history: [clean/messy - offer to squash if messy]
- Tests: Running...
- Linting: Running...
- Build: Running...

📊 Results:
✓ Tests: All passing (X tests, X ms)
✓ Lint: No errors
✓ Build: Success

📝 Commits to be pushed:
[list of commits with messages]

Ready to push to: origin/[branch-name]

Proceed? (y/n)
```

### **Then execute:**

```bash
# 1. Final checks
npm run test
npm run check
npm run build

# 2. Show what will be pushed
git log origin/main..HEAD --oneline

# 3. Push
git push -u origin branch-name

# 4. Provide next steps
"✅ Pushed! Next: Create PR at [github-url]"
```

---

## 📦 Template 4: Creating Pull Request

### **User says:** "Create PR" or "Ready for review"

### **Claude responds:**

```markdown
📦 Preparing Pull Request...

🔍 Final checks:
- Rebase on main: [needed/not-needed]
- Commit history: [X commits - clean/needs-squash]
- All tests: Running...
- Documentation: [complete/needs-update]
- Breaking changes: [yes/no]

📊 PR Summary:
Files changed: [count]
Lines added: [count]
Lines removed: [count]
Commits: [count]

📝 Suggested PR title:
[type]: [Description matching commit style]

📝 Suggested PR description:
[Auto-generated from commits + checklist]

Actions needed:
1. [If needed] Rebase on main
2. [If needed] Squash commits
3. [If needed] Update documentation
4. Push final changes
5. Create PR on GitHub

Proceed with auto-fixes? (y/n)
```

### **Then execute:**

```bash
# 1. Rebase if needed
git checkout main && git pull origin main
git checkout feat/branch
git rebase main

# 2. Squash if needed
git rebase -i HEAD~X  # if messy history

# 3. Final push
git push --force-with-lease origin branch

# 4. Show PR URL
"✅ Ready! Create PR at: [github-pr-url]

📋 Use this:
Title: [suggested-title]
Description: [link to generated description file]"
```

---

## 🔧 Template 5: Fixing Mistakes

### **User says:** "Oops, wrong commit" or "Need to undo"

### **Claude responds:**

```markdown
🔧 Git rescue mode activated!

Current situation:
Last commit: [hash] - [message]
Branch: [branch-name]
Status: [clean/dirty]

Common fixes:
1. Undo last commit (keep changes)
2. Undo last commit (discard changes)
3. Amend last commit
4. Move commit to different branch
5. Squash last N commits

What happened and what should we do?
```

### **Then provide specific solutions:**

**Undo last commit (keep changes):**
```bash
git reset --soft HEAD~1
"✅ Commit undone, changes staged. Ready to recommit."
```

**Amend last commit:**
```bash
git add [missing-files]
git commit --amend --no-edit
"✅ Commit amended with new changes."
```

**Wrong branch:**
```bash
git branch correct-branch
git reset --hard origin/current-branch
git checkout correct-branch
"✅ Commit moved to correct branch!"
```

---

## 🐛 Template 6: Bug Fix Workflow

### **User says:** "There's a bug in [feature]"

### **Claude responds:**

```markdown
🐛 Bug fix mode activated!

📋 Information needed:
1. What's the expected behavior?
2. What's actually happening?
3. Steps to reproduce?
4. Any error messages?

🎯 Bug fix workflow:
1. Create fix branch: `fix/[descriptive-name]`
2. Write failing test (reproduces bug)
3. Fix the bug
4. Verify test passes
5. Add regression test
6. Document the fix
7. Create PR

Ready to start? Please describe the bug.
```

### **Then execute:**

```bash
# 1. Create fix branch
git checkout -b fix/descriptive-name

# 2. Create failing test first
[Write test that fails]
git commit -m "test: add failing test for [bug]"

# 3. Fix the bug
[Implement fix]
git commit -m "fix: resolve [bug description]"

# 4. Verify
npm run test
git commit -m "test: add regression test for [bug]"

# 5. Document
git commit -m "docs: document [bug] fix"
```

---

## 📚 Template 7: Documentation Update

### **User says:** "Update docs for [feature]"

### **Claude responds:**

```markdown
📚 Documentation update mode!

🔍 Analyzing [feature]...

Documents to update:
- [ ] README.md - [needed/not-needed]
- [ ] API docs - [needed/not-needed]
- [ ] Code comments - [needed/not-needed]
- [ ] Examples - [needed/not-needed]
- [ ] Migration guide - [needed/not-needed]

📝 Documentation checklist:
1. Clear explanation of what it does
2. Usage examples
3. API reference
4. Edge cases and limitations
5. Related features/docs

Proceed with updates?
```

### **Then execute:**

```bash
# Update docs
[Make documentation changes]

# Commit
git commit -m "docs: document [feature]

- Add usage examples
- Update API reference
- Add edge case notes"
```

---

## 🔄 Template 8: Refactoring

### **User says:** "Refactor [component/module]"

### **Claude responds:**

```markdown
🔄 Refactoring mode!

🎯 Refactoring: [component/module]

⚠️ Safety checklist:
1. All tests currently passing? [yes/no]
2. Create backup branch? [recommended]
3. Refactor approach:
   - Incremental (safer, multiple commits)
   - Complete (faster, single commit)

📋 Refactoring plan:
1. Ensure 100% test coverage
2. Create refactor branch
3. Make changes incrementally
4. Run tests after each change
5. Update docs if needed

Approach: [incremental/complete]?
```

### **Then execute:**

```bash
# 1. Backup
git branch backup-before-refactor

# 2. Create branch
git checkout -b refactor/component-name

# 3. Incremental refactoring
[Make change 1]
npm run test
git commit -m "refactor: [change 1 description]"

[Make change 2]
npm run test
git commit -m "refactor: [change 2 description]"

# 4. Final verification
npm run test
npm run build
```

---

## 🎨 Template 9: Adding Tests

### **User says:** "Add tests for [feature]"

### **Claude responds:**

```markdown
🧪 Test suite creation!

📋 Testing strategy for [feature]:

Test types needed:
- [ ] Unit tests - [count] tests
- [ ] Integration tests - [count] tests
- [ ] E2E tests - [count] tests

📝 Test coverage plan:
1. Happy path scenarios
2. Edge cases
3. Error conditions
4. Boundary conditions
5. Integration points

Estimated tests: [count]

Proceed with test creation?
```

### **Then execute:**

```bash
# Create tests
[Write comprehensive tests]

# Commit
git commit -m "test: add comprehensive tests for [feature]

- Add unit tests ([count] tests)
- Add integration tests ([count] tests)
- Cover edge cases and errors
- Achieve [X]% coverage"
```

---

## 🚨 Template 10: Emergency Hotfix

### **User says:** "Production bug! Need hotfix!"

### **Claude responds:**

```markdown
🚨 EMERGENCY HOTFIX MODE!

⚡ Fast-track protocol:
1. Create hotfix from main
2. Minimal fix only
3. Critical tests only
4. Fast-track review

🎯 Hotfix workflow:
```bash
git checkout main
git pull origin main
git checkout -b hotfix/[critical-bug]
```

What's the critical bug?
```

### **Then execute priority workflow:**

```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-bug

# 2. Make minimal fix
[Implement fix - minimum code change]

# 3. Add critical test
[Add test that proves fix works]

# 4. Verify
npm run test

# 5. Immediate commit and push
git commit -m "fix: [CRITICAL] resolve [bug description]"
git push -u origin hotfix/critical-bug

# 6. Instructions
"🚨 Hotfix ready!
1. Create PR immediately
2. Request emergency review
3. Merge to main
4. Tag release
5. Cherry-pick to develop if needed"
```

---

## 💡 Usage Instructions

**For each workflow:**

1. **Copy the template** that matches the scenario
2. **Fill in the brackets** with actual values
3. **Execute the bash commands** in order
4. **Verify results** at each step
5. **Communicate clearly** with the user

**Templates ensure:**
- ✅ Consistent quality
- ✅ No missed steps
- ✅ Proper communication
- ✅ Automated checks
- ✅ Clean git history

---

**Remember: These are templates, not scripts. Adapt to context while maintaining quality standards.** 🎯
