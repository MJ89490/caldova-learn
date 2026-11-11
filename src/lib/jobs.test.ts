import { describe, it, expect } from 'vitest';
import { sortByNewest, formatPostedDate, getDepartments, getLocations, filterJobs } from './jobs';
import type { Job } from '../types/job';

function makeJob(
    slug: string,
    postedDate: string,
    overrides: Partial<Pick<Job, 'department' | 'location'>> = {},
): Job {
    return {
        slug,
        title: `Role ${slug}`,
        department: overrides.department ?? 'Technology',
        location: overrides.location ?? 'Remote',
        type: 'Full-time',
        remote: true,
        postedDate,
        summary: 'A role.',
    };
}

describe('sortByNewest', () => {
    it('orders jobs by posted date, newest first', () => {
        const jobs = [
            makeJob('a', '2027-01-01'),
            makeJob('b', '2027-03-15'),
            makeJob('c', '2027-02-10'),
        ];
        expect(sortByNewest(jobs).map((j) => j.slug)).toEqual(['b', 'c', 'a']);
    });

    it('does not mutate the input array', () => {
        const jobs = [makeJob('a', '2027-01-01'), makeJob('b', '2027-03-15')];
        const original = jobs.map((j) => j.slug);
        sortByNewest(jobs);
        expect(jobs.map((j) => j.slug)).toEqual(original);
    });
});

describe('formatPostedDate', () => {
    it('formats an ISO date as a readable string', () => {
        expect(formatPostedDate('2027-01-05')).toBe('January 5, 2027');
    });

    it('returns the raw value when the date is unparseable', () => {
        expect(formatPostedDate('not-a-date')).toBe('not-a-date');
    });
});

describe('getDepartments', () => {
    it('returns distinct departments sorted alphabetically', () => {
        const jobs = [
            makeJob('a', '2027-01-01', { department: 'Finance' }),
            makeJob('b', '2027-01-02', { department: 'Engineering' }),
            makeJob('c', '2027-01-03', { department: 'Finance' }),
        ];
        expect(getDepartments(jobs)).toEqual(['Engineering', 'Finance']);
    });

    it('returns an empty array for an empty input', () => {
        expect(getDepartments([])).toEqual([]);
    });
});

describe('getLocations', () => {
    it('returns distinct locations sorted alphabetically', () => {
        const jobs = [
            makeJob('a', '2027-01-01', { location: 'Remote' }),
            makeJob('b', '2027-01-02', { location: 'Amsterdam, Netherlands' }),
            makeJob('c', '2027-01-03', { location: 'Remote' }),
        ];
        expect(getLocations(jobs)).toEqual(['Amsterdam, Netherlands', 'Remote']);
    });

    it('returns an empty array for an empty input', () => {
        expect(getLocations([])).toEqual([]);
    });
});

describe('filterJobs', () => {
    const jobs = [
        makeJob('a', '2027-01-01', { department: 'Engineering', location: 'Remote' }),
        makeJob('b', '2027-01-02', { department: 'Engineering', location: 'London, UK' }),
        makeJob('c', '2027-01-03', { department: 'Finance', location: 'Remote' }),
        makeJob('d', '2027-01-04', { department: 'Finance', location: 'London, UK' }),
    ];

    it('returns all jobs when no filters are given', () => {
        expect(filterJobs(jobs, {})).toEqual(jobs);
    });

    it('returns all jobs when filters are empty arrays (supports reset)', () => {
        expect(filterJobs(jobs, { departments: [], locations: [] })).toEqual(jobs);
    });

    it('filters by department only', () => {
        expect(filterJobs(jobs, { departments: ['Engineering'] }).map((j) => j.slug)).toEqual([
            'a',
            'b',
        ]);
    });

    it('filters by location only', () => {
        expect(filterJobs(jobs, { locations: ['Remote'] }).map((j) => j.slug)).toEqual(['a', 'c']);
    });

    it('OR-combines multiple values within the same category', () => {
        expect(
            filterJobs(jobs, { departments: ['Engineering', 'Finance'] }).map((j) => j.slug),
        ).toEqual(['a', 'b', 'c', 'd']);
    });

    it('AND-combines department and location selections', () => {
        expect(
            filterJobs(jobs, { departments: ['Engineering'], locations: ['Remote'] }).map(
                (j) => j.slug,
            ),
        ).toEqual(['a']);
    });

    it('returns an empty array when no job matches the combination', () => {
        expect(
            filterJobs(jobs, { departments: ['Finance'], locations: ['Nowhere'] }),
        ).toEqual([]);
    });

    it('returns an empty array for an unknown filter value', () => {
        expect(filterJobs(jobs, { departments: ['Unknown Department'] })).toEqual([]);
    });

    it('does not mutate the input array', () => {
        const original = jobs.map((j) => j.slug);
        filterJobs(jobs, { departments: ['Engineering'] });
        expect(jobs.map((j) => j.slug)).toEqual(original);
    });
});
