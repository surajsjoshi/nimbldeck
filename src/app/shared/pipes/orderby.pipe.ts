import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderby'
})
export class OrderbyPipe implements PipeTransform {

  static _orderByComparator(a: any, b: any): number {
    if ((isNaN(parseFloat(a)) || !isFinite(a)) || (isNaN(parseFloat(b)) || !isFinite(b))) {
      // Not a number
      if (a.toLowerCase() < b.toLowerCase()) { return -1; };
      if (a.toLowerCase() > b.toLowerCase()) { return 1; };
    } else {
      if (parseFloat(a) < parseFloat(b)) { return -1; };
      if (parseFloat(a) > parseFloat(b)) { return 1; };
    }
    return 0;
}

  transform(input: any, config?: any): any {
    if (!Array.isArray(input)) {
      return input;
    }
   if (!Array.isArray(config) || Array.isArray(config) && config.length === 1) {
     let propertyToCheck: string = !Array.isArray(config) ? config : config[0];
     let descending = propertyToCheck.substr(0, 1) === '-';
     if (!propertyToCheck || propertyToCheck === '-' || propertyToCheck === '+') {
        return !descending ? input.sort() : input.sort().reverse();
     }

     let property: string = propertyToCheck.substr(0, 1) === '+' ||
         propertyToCheck.substr(0, 1) === '-' ? propertyToCheck.substr(1) : propertyToCheck;

     return input.sort(function (a: any, b: any) {
        return !descending ? OrderbyPipe._orderByComparator(a[property], b[property]) :
          -OrderbyPipe._orderByComparator(a[property], b[property]);
});
   }
  }

}
