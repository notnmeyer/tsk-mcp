import { TskReference, TskCommand, TomlSyntaxElement } from "../types/index.js";

export const tskReference: TskReference = {
  commands: [
    {
      name: "run",
      description: "Run a specific task or the default task",
      usage: "tsk run [TASK_NAME] [OPTIONS]",
      examples: ["tsk run", "tsk run build", "tsk run test --verbose"],
      options: [
        {
          name: "verbose",
          shorthand: "v",
          description: "Enable verbose output",
          type: "boolean",
          default: false,
        },
        {
          name: "dry-run",
          shorthand: "d",
          description: "Show what would be executed without running",
          type: "boolean",
          default: false,
        },
        {
          name: "file",
          shorthand: "f",
          description: "Specify the task file to use",
          type: "string",
          default: "tsk.toml",
        },
      ],
    },
    {
      name: "list",
      description: "List all available tasks",
      usage: "tsk list [OPTIONS]",
      examples: ["tsk list", "tsk list --verbose"],
      options: [
        {
          name: "verbose",
          shorthand: "v",
          description: "Show task descriptions and dependencies",
          type: "boolean",
          default: false,
        },
        {
          name: "file",
          shorthand: "f",
          description: "Specify the task file to use",
          type: "string",
          default: "tsk.toml",
        },
      ],
    },
    {
      name: "init",
      description: "Initialize a new tsk.toml file in the current directory",
      usage: "tsk init [OPTIONS]",
      examples: ["tsk init", "tsk init --force"],
      options: [
        {
          name: "force",
          shorthand: "f",
          description: "Overwrite existing tsk.toml file",
          type: "boolean",
          default: false,
        },
      ],
    },
    {
      name: "validate",
      description: "Validate the syntax of a task file",
      usage: "tsk validate [FILE]",
      examples: ["tsk validate", "tsk validate tasks.toml"],
      options: [
        {
          name: "file",
          shorthand: "f",
          description: "Specify the task file to validate",
          type: "string",
          default: "tsk.toml",
        },
      ],
    },
    {
      name: "graph",
      description: "Show task dependency graph",
      usage: "tsk graph [OPTIONS]",
      examples: ["tsk graph", "tsk graph --format dot"],
      options: [
        {
          name: "format",
          description: "Output format for the graph",
          type: "string",
          default: "text",
          validValues: ["text", "dot", "json"],
        },
      ],
    },
  ],

  syntax: [
    {
      key: "version",
      type: "string",
      description: "Specifies the tsk configuration version",
      examples: ['version = "1.0"'],
      required: false,
    },
    {
      key: "default_task",
      type: "string",
      description: "The task to run when no task is specified",
      examples: ['default_task = "build"'],
      required: false,
    },
    {
      key: "env",
      type: "table",
      description: "Global environment variables available to all tasks",
      examples: [
        'env = { NODE_ENV = "development", DEBUG = "true" }',
        '[env]\nNODE_ENV = "development"\nDEBUG = "true"',
      ],
      required: false,
    },
    {
      key: "tasks",
      type: "table",
      description: "Table containing all task definitions",
      examples: ["[tasks]", "[tasks.build]"],
      required: true,
    },
    {
      key: "tasks.*.description",
      type: "string",
      description: "Human-readable description of the task",
      examples: ['description = "Build the project"'],
      required: false,
    },
    {
      key: "tasks.*.script",
      type: "string",
      description: "Shell script to execute for this task",
      examples: [
        'script = "npm run build"',
        'script = "echo \\"Building...\\" && make all"',
      ],
      required: false,
    },
    {
      key: "tasks.*.command",
      type: "string",
      description: "Command to execute (alternative to script)",
      examples: ['command = "npm"', 'command = "/usr/bin/make"'],
      required: false,
    },
    {
      key: "tasks.*.args",
      type: "array",
      description: "Arguments to pass to the command",
      examples: ['args = ["run", "build"]', 'args = ["test", "--coverage"]'],
      required: false,
    },
    {
      key: "tasks.*.dependencies",
      type: "array",
      description: "List of tasks that must run before this task",
      examples: [
        'dependencies = ["clean", "install"]',
        'dependencies = ["test"]',
      ],
      required: false,
    },
    {
      key: "tasks.*.env",
      type: "table",
      description: "Environment variables specific to this task",
      examples: [
        'env = { NODE_ENV = "production" }',
        '[tasks.build.env]\nNODE_ENV = "production"',
      ],
      required: false,
    },
    {
      key: "tasks.*.workdir",
      type: "string",
      description: "Working directory for the task execution",
      examples: ['workdir = "./frontend"', 'workdir = "/tmp/build"'],
      required: false,
    },
    {
      key: "tasks.*.timeout",
      type: "number",
      description: "Maximum execution time in seconds",
      examples: ["timeout = 300", "timeout = 60"],
      required: false,
    },
    {
      key: "tasks.*.parallel",
      type: "boolean",
      description: "Whether this task can run in parallel with others",
      examples: ["parallel = true", "parallel = false"],
      required: false,
    },
  ],

  examples: [
    {
      name: "Basic Task File",
      description: "Simple tsk.toml with common tasks",
      content: `# the environment can be specified at the top level where it is inherited by all tasks
      env = {
        NAME = "tsk",
      }

      dotenv = ".top.env"

      # the location to look for scripts when a task doesn't contains "cmds"
      # script_dir = "tsk"

      # at its simplest, tasks are a series of sequential shell commands expressed
      # as a list of strings
      [tasks.hello_world]
      cmds = [
        "echo hello world",
      ]

      [tasks.pwd]
      dir = "/tmp" # set the working directory for the task
      cmds = [
        "echo \"my pwd is $(pwd)\"", # you can use subshells
      ]

      # when cmds are omitted tsk attempts to run a script located at tsk/<task_name>
      [tasks.no_cmd]
      env = {
        GREETING = "Hello",
      }

      # tasks can have dependencies. dependencies run before cmds. dependencies are other
      # tasks and cannot be shell commands (yet)
      [tasks.deps]
      deps = [["setup1"]]
      cmds = ["echo 'running cmd...'"]

      # if a task's dep has deps those are run too
      [tasks.deps_of_deps]
      deps = [["setup4"]]
      cmds = ["echo 'running cmd...'"]

      # dependency groups are a way to order dependencies while allowing for parallelization
      [tasks.dep_groups]
      deps = [
        ["setup1", "setup2"], # setup1 and setup2 run in parallel
        ["setup3"],           # setup3 runs after the tasks in the previous group complete
      ]
      cmds = ["echo 'running cmd...'"]

      # a dotenv file can be supplied at the task level. see the README for information
      # about env var hierarchy
      [tasks.dotenv]
      dotenv = ".env"
      env = {
        FOO = "bar",
      }
      cmds = [
        "echo $FOO",
        "echo $BAR",
      ]

      [tasks.top_level_env]
      cmds = [
        'echo "My name is $NAME!"'
      ]

      [tasks.top_level_dotenv]
      cmds = [
        'echo "$BLAH"'
      ]

      [tasks.template]
      cmds = [
        "echo {{.CLI_ARGS}}"
      ]

      # if a dep or command fails tsk exits. in this example, "hello world" will _not_ be echoed.
      [tasks.fail_on_error]
      deps = [["exit"]]
      cmds = ["echo hello world"]

      # tasks used to demonstrate features above
      [tasks.setup1]
      cmds = ["sleep 1", "echo 'doing setup1...'"]

      [tasks.setup2]
      cmds = ["echo 'doing setup2...'"]

      [tasks.setup3]
      cmds = ["echo 'doing setup3...'"]

      [tasks.setup4]
      deps = [["setup2"]]
      cmds = ["echo 'doing setup4...'"]

      [tasks.exit]
      cmds = ["echo exiting 1...", "exit 1"]

      [tasks.non_existent_dep]
      deps = [["non-existent-task"]]
      cmds = ["echo 'running cmd...'"]

      [tasks.desc]
      desc = "this is a short desc"
      description = '''
        this is a multi-line
        description blah blah blah
        blah blah blah
      '''
      cmds = ["echo desc"]`,
    },
  ],
};
