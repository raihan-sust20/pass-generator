import { Injectable } from '@nestjs/common';
import * as R from 'ramda';
import { GeneratePasswordDto } from './dto/generate-password.dto';
// import { customAlphabet } from 'nanoid';
import { customAlphabet } from 'nanoid';

export enum CharCase {
  Upper = 'upper',
  Lower = 'lower',
}

@Injectable()
export class AppService {
  private symbols = '!"#$%&\'()*+,-./:;<=>?@[]^_`{|}~';

  private generateAlphabet(charCase: CharCase) {
    const startChar = charCase === CharCase.Upper ? 'A' : 'a';
    return R.pipe(
      R.range(0),
      R.map((index: number) => {
        return index + startChar;
      }),
      R.join(''),
    )(25);
  }

  private lowerCaseAlphabet = this.generateAlphabet(CharCase.Lower);
  private upperCaseAlphabet = this.generateAlphabet(CharCase.Upper);

  generatePassword(requestData: GeneratePasswordDto): string {
    const passwordLength = R.prop('passwordLength', requestData);

    const charString =
      this.lowerCaseAlphabet + this.upperCaseAlphabet + this.symbols;

    const nanoId = customAlphabet(charString, passwordLength);

    return nanoId();
  }
}
