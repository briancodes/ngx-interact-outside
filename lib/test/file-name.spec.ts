import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

// Importing from the distibutable folder
import { } from '../../dist/lib';

describe('Library', () => {
    it('tests should be reachable', async(() => {
        const a = {};
        expect(a).toBeTruthy();
    }));
});
