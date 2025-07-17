# QHSE Admin Dashboard

A modern, responsive admin dashboard built with React JS and TailwindCSS for Quality, Health, Safety, and Environment management.

## 📊 Dashboard Summary Cards

The dashboard displays summary cards for key project metrics, such as:

- **CARs Open**: Total number of Corrective Action Requests currently open.
- **Observations Open**: Total number of open observations.
- **Delay in Audits (days)**: Total days of audit delays across all projects.
- **Project KPIs Achieved (%)**: Average percentage of KPIs achieved for all projects.

All values are **calculated dynamically** from the latest project data.

### Example

| Metric                     | Current Value | Previous Value | Trend  |
|----------------------------|--------------|----------------|--------|
| CARs Open                  | 12           | 10             | +2     |
| Observations Open          | 8            | 9              | -1     |
| Delay in Audits (days)     | 5            | 7              | -2     |
| Project KPIs Achieved (%)  | 85%          | 80%            | +5%    |

- The **Trend** column shows the change compared to the previous period, so you can quickly see if things are improving or need attention.
- To update the dashboard, simply update the project data source—no UI changes are needed.


