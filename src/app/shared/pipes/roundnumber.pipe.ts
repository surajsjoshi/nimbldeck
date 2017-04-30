// round.pipe.ts
import {Pipe, PipeTransform} from '@angular/core';
/**
 *
 */
@Pipe({name: 'round'})
export class RoundNumberPipe implements PipeTransform {
    /**
     *
     * @param value
     * @returns {number}
     */
    transform(value: number): number {
        return Math.round(value * 100) / 100;
    }
}
