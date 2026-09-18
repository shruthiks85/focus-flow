# Simplified task list with pagination

## Build
- Restyle the page as a clean, compact task table inspired by the reference while keeping the existing task fields and add/edit/delete actions.
- Place a compact status filter row above the list: All, ** IU, ** UNI, * INU, and * NINU, with counts and a clear active state.
- Paginate the filtered results, reset safely when filters or deletions change the available pages, and provide previous/next plus page buttons.
- Keep a card-style mobile list with the same filters, actions, and pagination.

## Technical details
- Keep tasks in the existing browser storage and preserve current task data.
- Use the existing semantic colors and shared controls, adding only the tokens needed for the simpler visual treatment.
- Verify desktop and mobile layouts, filter behavior, pagination, task editing, deletion, and preview health.
