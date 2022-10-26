const cwd = process.cwd();

module.exports = (plop) => {
  // Nest.js module generator
  plop.setGenerator('module', {
    description: 'Generate a new nest.js module',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Please Enter new module name:',
        default: 'MyModule',
        validate(value) {
          if (!/^[A-Za-z][A-Za-z0-9]+$/.test(value))
            return 'Invalidte module name!';
          // return componentExists(value) ? 'Component name already exists!' : true;
          return true;
        },
      },
    ],
    actions: [
      // module, controller, service and resolver
      {
        type: 'add',
        path: `${cwd}/src/modules/{{properCase name}}/{{camelCase name}}.module.ts`,
        templateFile: `${__dirname}/module-template/module.hbs`,
        abortOnFail: false,
      },
      {
        type: 'add',
        path: `${cwd}/src/modules/{{properCase name}}/{{camelCase name}}.controller.ts`,
        templateFile: `${__dirname}/module-template/controller.hbs`,
        abortOnFail: false,
      },
      {
        type: 'add',
        path: `${cwd}/src/modules/{{properCase name}}/{{camelCase name}}.service.ts`,
        templateFile: `${__dirname}/module-template/service.hbs`,
        abortOnFail: false,
      },
      // {
      //   type: "add",
      //   path: `${cwd}/src/modules/{{properCase name}}/{{camelCase name}}.resolver.ts`,
      //   templateFile: `${__dirname}/module-template/resolver.hbs`,
      //   abortOnFail: false
      // },
      // schema and seed
      // {
      //   type: "add",
      //   path: `${cwd}/src/modules/{{properCase name}}/schemas/seed.json`,
      //   templateFile: `${__dirname}/module-template/schemas/seed.hbs`,
      //   abortOnFail: false
      // },
      {
        type: 'add',
        path: `${cwd}/src/modules/{{properCase name}}/schemas/{{camelCase name}}.schemas.ts`,
        templateFile: `${__dirname}/module-template/schemas/schemas.hbs`,
        abortOnFail: false,
      },
      // {
      //   type: "add",
      //   path: `${cwd}/src/modules/{{properCase name}}/schemas/{{camelCase name}}.gql`,
      //   templateFile: `${__dirname}/module-template/schemas/gql.hbs`,
      //   abortOnFail: false
      // },
      // models
      {
        type: 'add',
        path: `${cwd}/src/modules/{{properCase name}}/models/index.ts`,
        templateFile: `${__dirname}/module-template/models/index.hbs`,
        abortOnFail: false,
      },
      {
        type: 'add',
        path: `${cwd}/src/modules/{{properCase name}}/models/{{camelCase name}}.create.model.ts`,
        templateFile: `${__dirname}/module-template/models/create.model.hbs`,
        abortOnFail: false,
      },
      {
        type: 'add',
        path: `${cwd}/src/modules/{{properCase name}}/models/{{camelCase name}}.update.model.ts`,
        templateFile: `${__dirname}/module-template/models/update.model.hbs`,
        abortOnFail: false,
      },
      {
        type: 'add',
        path: `${cwd}/src/modules/{{properCase name}}/models/{{camelCase name}}.search.model.ts`,
        templateFile: `${__dirname}/module-template/models/search.model.hbs`,
        abortOnFail: false,
      },
      // interfaces
      {
        type: 'add',
        path: `${cwd}/src/modules/{{properCase name}}/interfaces/{{camelCase name}}.interface.ts`,
        templateFile: `${__dirname}/module-template/interfaces/document.hbs`,
        abortOnFail: false,
      },
      {
        type: 'add',
        path: `${cwd}/src/modules/{{properCase name}}/interfaces/index.ts`,
        templateFile: `${__dirname}/module-template/interfaces/index.hbs`,
        abortOnFail: false,
      },
    ],
  });
};
