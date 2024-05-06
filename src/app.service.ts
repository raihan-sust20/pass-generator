import { Injectable } from '@nestjs/common';
import * as R from 'ramda';
import * as RA from 'ramda-adjunct';
import * as chalk from 'chalk';
import * as inquirer from 'inquirer';
import { customAlphabet } from 'nanoid';
import copy from 'copy-to-clipboard';

export enum CharType {
  UpperCase = 'upper-case',
  LowerCase = 'lower-case',
  Numbers = 'number',
  Symbols = 'symbols',
}

export enum PassType {
  EasyToSay = 'easy-to-say',
  EasyToRead = 'easy-to-read',
  AllCharacters = 'all-characters',
}

@Injectable()
export class AppService {
  private successText;
  private errorText;
  private secretText;
  private infoText;

  constructor() {
    this.successText = chalk.hex('#16A085');
    this.errorText = chalk.hex('#E74C3C ');
    this.secretText = chalk.hex('#da68a0');
    this.infoText = chalk.hex('#4a536b');
  }

  private validatePasswordLength(passwordLength: number) {
    return R.lte(4, passwordLength) && R.gte(2048, passwordLength)
      ? true
      : 'Password lenght must be between 4 and 2048';
  }

  private prepareCharTypeList(answers: Record<string, any>) {
    const initialChoiceList = [
      { name: 'Uppercase', value: CharType.UpperCase },
      { name: 'Lowercase', value: CharType.LowerCase },
    ];

    return answers.passwordType === PassType.EasyToSay
      ? initialChoiceList
      : R.concat(initialChoiceList, [
          {
            name: 'Numbers',
            value: CharType.Numbers,
          },
          {
            name: 'Symbols',
            value: CharType.Symbols,
          },
        ]);
  }

  private questions = [
    {
      type: 'number',
      name: 'passwordLength',
      message: 'Password length(Must be between 4 and 2048):',
      default: 4,
      validate: this.validatePasswordLength,
    },
    {
      type: 'list',
      name: 'passwordType',
      message: 'Please choose password property:',
      choices: [
        {
          name: 'Avoid numbers and special characters',
          value: PassType.EasyToSay,
        },
        {
          name: 'Avoid ambigious characters like O, 0, l, 1, |',
          value: PassType.EasyToRead,
        },
        {
          name: 'Use any character combination like 1,5, a, B, ~, #, &',
          value: PassType.AllCharacters,
        },
      ],
    },
    {
      type: 'checkbox',
      name: 'charTypeList',
      message: 'Please select characters to include in password: ',
      choices: this.prepareCharTypeList,
      validate(answers: CharType[]) {
        const selectedCharListLength = R.length(answers);

        return R.lt(0, selectedCharListLength)
          ? true
          : 'Please select at least one!';
      },
    },
  ];

  private generateAlphabet(charType: CharType.UpperCase | CharType.LowerCase) {
    const startChar = charType === CharType.UpperCase ? 'A' : 'a';
    return R.pipe(
      R.range(0),
      R.map((index: number) => {
        return index + startChar;
      }),
      R.join(''),
    )(25);
  }

  private getChars(charTypeList: CharType[]) {
    const symbols = '!"#$%&\'()*+,-./:;<=>?@[]^_`{|}~';
    const charStrGenerator = {
      [CharType.UpperCase]: this.generateAlphabet(CharType.UpperCase),
      [CharType.LowerCase]: this.generateAlphabet(CharType.LowerCase),
      [CharType.Numbers]: R.pipe(R.range(0), R.join(''))(9),
      [CharType.Symbols]: symbols,
    };

    return R.reduce(
      (finalCharStr: string, charTypeItem: CharType) => {
        return R.concat(finalCharStr, charStrGenerator[charTypeItem]);
      },
      '',
      charTypeList,
    );
  }

  private excludeAmbigousChars(charStr: string) {
    const ambigiousChars = ['O', '0', 'l', '1', '|'];

    return R.filter(R.pipe(R.includes(R.__, ambigiousChars), R.not), charStr);
  }

  async generatePassword(): Promise<void> {
    let shouldContinueProgram = true;

    while (RA.isTrue(shouldContinueProgram)) {
      try {
        let userResponse = {
          passwordType: [PassType.AllCharacters],
          charTypeList: [CharType.UpperCase],
          passwordLength: 8,
          continueProgram: true,
        };

        userResponse = await inquirer.prompt(this.questions);

        const { passwordType, charTypeList, passwordLength } = userResponse;
        const charString = this.getChars(charTypeList);
        const finalCharString = R.equals(passwordType, PassType.EasyToRead)
          ? this.excludeAmbigousChars(charString)
          : charString;

        const nanoId = customAlphabet(finalCharString, passwordLength);
        const password = nanoId();

        console.log(
          this.successText.bold('Generated Password:\n'),
          this.secretText.italic(`${password}\n\n`),
        );

        /**
         * @todo Find a safe way to copy password to clipboard.
         */

        userResponse = await inquirer.prompt({
          type: 'confirm',
          name: 'continueProgram',
          message: 'Generate another password?',
        });

        shouldContinueProgram = R.prop('continueProgram', userResponse);
      } catch (error) {
        console.log(this.errorText('Whoops! Something went wrong.'));
        console.log(this.errorText(error));
      }
    }
  }
}
