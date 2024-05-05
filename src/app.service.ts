import { Injectable } from '@nestjs/common';
import * as R from 'ramda';
import * as chalk from 'chalk';
import * as prompts from 'prompts';
import { customAlphabet } from 'nanoid';
import { exec } from 'child_process';

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
  private passwordType = undefined;
  private successText;
  private errorText;

  constructor() {
    this.successText = chalk.hex('#16A085');
    this.errorText = chalk.hex('#E74C3C ');
  }

  private promptsObject = [
    {
      type: 'number',
      name: 'passwordLength',
      message: 'Password length:',
      initial: 4,
      style: 'default',
      min: 4,
      max: 2048,
    },
    {
      type: 'select',
      name: 'passwordType',
      message: 'Please choose password type:',
      choices: [
        {
          title: 'Easy to say',
          description: 'Avoid numbers and special characters',
          value: PassType.EasyToSay,
        },
        {
          title: 'Easy to read',
          description: 'Avoid ambigious characters like O, 0, l, 1, |',
          value: PassType.EasyToRead,
          disabled: true,
        },
        {
          title: 'All characters',
          description: 'Any character combination like 1,5, a, B, ~, #, &',
          value: PassType.AllCharacters,
        },
      ],
      initial: 3,
      format: (passwordType) => {
        this.passwordType = passwordType;

        return passwordType;
      },
    },
    {
      type: 'multiselect',
      name: 'charTypeList',
      message: 'Please select characters to include',
      instructions: true,
      choices: [
        { title: 'Uppercase', value: CharType.UpperCase, selected: true },
        { title: 'Lowercase', value: CharType.LowerCase, selected: true },
        {
          title: 'Numbers',
          value: CharType.Numbers,
          disabled: this.passwordType === PassType.EasyToSay,
        },
        {
          title: 'Symbols',
          value: CharType.Symbols,
          disabled: this.passwordType === PassType.EasyToSay,
        },
      ],
      min: 1,
      hint: '- Space to select. Return to submit',
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
      [CharType.Numbers]: R.range(0, 9),
      [CharType.Symbols]: symbols,
    };

    return R.reduce(
      (charTypeItem: CharType, finalCharStr: string) => {
        return R.concat(finalCharStr, charStrGenerator[charTypeItem]);
      },
      '',
      charTypeList,
    );
  }

  async generatePassword(): Promise<void> {
    let shouldContinueProgram = true;

    while (shouldContinueProgram) {
      let userResponse = {
        charTypeList: [CharType.UpperCase],
        passwordLength: 8,
      };

      await (async () => {
        userResponse = await prompts(this.promptsObject);
      })();

      const { charTypeList, passwordLength } = userResponse;
      const charString = this.getChars(charTypeList);

      const nanoId = customAlphabet(charString, passwordLength);
      const password = nanoId();

      console.log(this.successText(`Generated Password: ${password}\n\n\n`));

      exec(`xclip ${password}`, (error) => {
        if (error) {
          console.log(this.errorText('Please confirm xclip is installed'));
          console.error(this.errorText(`Shell error: ${error}`));
          return;
        }

        if (R.isNil(error)) {
          console.log(
            this.successText('Password has been copied to clipboard!'),
          );
        }
      });

      await (async function () {
        userResponse = await prompts({
          type: 'confirm',
          name: 'continueProgram',
          message: 'Generate another password?',
          initial: true,
        });
      })();

      shouldContinueProgram = R.prop('continueProgram', userResponse);
    }
  }
}
