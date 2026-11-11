/**
 * Pure, side-effect-free helpers for working with job postings.
 *
 * These operate on plain `Job[]` arrays (already loaded from the content
 * collection by the calling page) so they can be unit tested without the Astro
 * content runtime or a database.
 */
import type { Job } from '../types/job';

/** Return jobs sorted by posted date, newest first (does not mutate input). */
export function sortByNewest(jobs: Job[]): Job[] {
    return [...jobs].sort(
        (a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime(),
    );
}

/**
 * Format an ISO-8601 date as a human-readable posted date,
 * e.g. "January 5, 2027". Falls back to the raw value if unparseable.
 */
export function formatPostedDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return iso;
    }
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    });
}

/** Return the distinct department values present in `jobs`, alphabetically sorted. */
export function getDepartments(jobs: Job[]): string[] {
    return [...new Set(jobs.map((job) => job.department))].sort((a, b) => a.localeCompare(b));
}

/** Return the distinct location values present in `jobs`, alphabetically sorted. */
export function getLocations(jobs: Job[]): string[] {
    return [...new Set(jobs.map((job) => job.location))].sort((a, b) => a.localeCompare(b));
}

/**
 * Selected filter values for narrowing a `Job[]` list.
 *
 * Within a category (e.g. `departments`), values are combined with OR, so
 * selecting multiple departments matches jobs in any of them. Across
 * categories, selections are combined with AND, so a job must satisfy both
 * the department selection (if any) and the location selection (if any).
 * An empty or omitted array for a category means "no filter applied" for
 * that category.
 */
export interface JobFilters {
    departments?: string[];
    locations?: string[];
}

/**
 * Return jobs matching the given `filters` (does not mutate input).
 * See `JobFilters` for the AND-across/OR-within-category combination rules.
 * Passing no filters (or empty arrays) returns all jobs, supporting resets.
 */
export function filterJobs(jobs: Job[], filters: JobFilters): Job[] {
    const departments = filters.departments ?? [];
    const locations = filters.locations ?? [];

    return jobs.filter((job) => {
        const matchesDepartment = departments.length === 0 || departments.includes(job.department);
        const matchesLocation = locations.length === 0 || locations.includes(job.location);
        return matchesDepartment && matchesLocation;
    });
}
