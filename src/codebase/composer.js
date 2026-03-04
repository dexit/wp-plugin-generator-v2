import { slug } from "../utils/helpers";
export const composerCode = (data) => {
  let baseNamespace = data.baseNamespace.replace(/\\/g, "\\\\");

  let code = `{
    "name": "${data.author.replace(/\s/g, '').toLowerCase()}/${slug(data.pluginName)}",
    "description": "${data.description}",
    "type": "wordpress-plugin",
    "license": "${data.license}",
    "authors": [
        {
            "name": "${data.author}",
            "email": "${data.authorEmail}"
        }
    ],
    "minimum-stability": "stable",
    "prefer-stable": true,
    "require": {
        "php": ">=8.2"
    },
    "require-dev": {
        "wp-coding-standards/wpcs": "^3.1",
        "phpcsstandards/phpcsutils": "^1.0",
        "phpcompatibility/phpcompatibility-wp": "^2.1",
        "dealerdirect/phpcodesniffer-composer-installer": "^1.0",
        "phpunit/phpunit": "^10.0 || ^11.0",
        "brain/monkey": "^2.6",
        "mockery/mockery": "^1.6"
    },
    "autoload": {
        "psr-4": {
            "${baseNamespace}\\\\": "includes/"
        },
        "files": [
            "includes/functions.php"
        ]
    },
    "config": {
        "allow-plugins": {
            "dealerdirect/phpcodesniffer-composer-installer": true
        }
    }
}
`;

  return code;
};
