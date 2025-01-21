# Eliza Ensurance Agents

## Setup

1. Clone the repository:
```bash
git clone https://github.com/basin-global/eliza-ensurance-agents.git
cd eliza-ensurance-agents
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the application with an example character:
```bash
# Once example characters are available:
pnpm start --character="characters-examples/ensurance-agents/example.json"
```

## Working with Characters

Check out `characters-examples/ensurance-agents` for example character configurations.

To create your own character:
1. Review the examples in `characters-examples/ensurance-agents`
2. Create your own character file in the local `/characters` directory or use example path
3. Use your character file path in the start command

## Private Characters Repository

⚠️ The `@characters` directory is maintained as a private submodule and is not publicly accessible. See [CHARACTERS_README.md](CHARACTERS_README.md) for more details about accessing the private characters repository.

## Development Environment

We recommend using [Cursor.ai](https://cursor.com) as your IDE for development. It provides excellent AI-assisted coding capabilities and is optimized for working with this codebase.