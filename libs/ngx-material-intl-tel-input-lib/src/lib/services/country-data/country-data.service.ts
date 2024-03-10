import { Injectable } from '@angular/core';
import { Country } from '../../types/country.model';
import {
  PhoneNumberFormat,
  PhoneNumberType,
  PhoneNumberUtil
} from 'google-libphonenumber';
import { CountryCode, CountryData } from '../../data/country-code';
import { CountryISO } from '../../enums/country-iso.enum';

@Injectable()
export class CountryDataService {
  phoneNumberUtil = PhoneNumberUtil.getInstance();

  /**
   * Retrieves a Country object based on the provided country data and placeholder flag.
   *
   * @param {CountryData} countryData - the country data used to create the Country object
   * @param {boolean} enablePlaceholder - a flag indicating whether to include a placeholder value
   * @return {Country} the generated Country object
   */
  private getCountryObject(
    countryData: CountryData,
    enablePlaceholder: boolean
  ): Country {
    const country: Country = {
      name: countryData[0].toString(),
      iso2: countryData[1].toString(),
      dialCode: countryData[2].toString(),
      priority: (countryData?.[3] && +countryData[3]) || 0,
      areaCodes: (countryData[4] as string[]) || undefined,
      htmlId: `country-code__${countryData[1].toString()}`,
      flagClass: `country-code__${countryData[1].toString().toLocaleLowerCase()}`,
      placeHolder: enablePlaceholder
        ? this.getPhoneNumberPlaceholder(
            countryData[1].toString().toUpperCase()
          )
        : ''
    };
    return country;
  }

  /**
   * Sorts the array of countries based on the preferred countries list.
   *
   * @param {Country[]} allCountries - the array of all countries to be sorted
   * @param {string[]} preferredCountries - the list of preferred countries
   * @return {Country[]} the sorted array of countries
   */
  private sortCountries(
    allCountries: Country[],
    preferredCountries?: string[]
  ): Country[] {
    if (preferredCountries?.length) {
      return allCountries.sort((a, b) => {
        if (
          preferredCountries.includes(a.iso2) &&
          !preferredCountries.includes(b.iso2)
        ) {
          return -1;
        } else if (
          !preferredCountries.includes(a.iso2) &&
          preferredCountries.includes(b.iso2)
        ) {
          return 1;
        }
        return 0;
      });
    }
    return allCountries;
  }

  /**
   * Retrieves the placeholder for a phone number based on the provided country code.
   *
   * @param {string} countryCode - The country code for the phone number.
   * @return {string} The formatted phone number placeholder.
   */
  protected getPhoneNumberPlaceholder(countryCode: string): string {
    try {
      return this.phoneNumberUtil.format(
        this.phoneNumberUtil.getExampleNumberForType(
          countryCode,
          PhoneNumberType.MOBILE
        ),
        PhoneNumberFormat.NATIONAL
      );
    } catch (e) {
      return '';
    }
  }

  /**
   * Process the list of countries based on the provided data and parameters.
   *
   * @param {CountryCode} countryCodeData - the data containing country codes
   * @param {boolean} enablePlaceholder - flag to enable placeholder
   * @param {(CountryISO | string)[]} [visibleCountries] - optional array of visible country ISO codes or country names
   * @param {(CountryISO | string)[]} [preferredCountries] - optional array of preferred country ISO codes or country names
   * @return {Country[]} the processed and sorted list of countries
   */
  processCountries(
    countryCodeData: CountryCode,
    enablePlaceholder: boolean,
    visibleCountries?: (CountryISO | string)[],
    preferredCountries?: (CountryISO | string)[]
  ): Country[] {
    const allCountries: Country[] = countryCodeData.allCountries.map(
      (countryData: CountryData) =>
        this.getCountryObject(countryData, enablePlaceholder)
    );
    const filteredCountries = visibleCountries?.length
      ? allCountries.filter((country) =>
          visibleCountries.includes(country.iso2)
        )
      : allCountries;
    const sortedCountries = this.sortCountries(
      filteredCountries,
      preferredCountries
    );
    return sortedCountries;
  }
}
