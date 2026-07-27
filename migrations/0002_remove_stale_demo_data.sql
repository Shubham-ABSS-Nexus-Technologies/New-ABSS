DELETE FROM leads
WHERE id IN ('lead-1', 'lead-2', 'lead-3', 'lead-4');

DELETE FROM projects
WHERE id IN ('project-1', 'project-2', 'project-3', 'project-4');

DELETE FROM clients
WHERE id IN ('client-1', 'client-2', 'client-3');

DELETE FROM tickets
WHERE id IN ('ticket-1', 'ticket-2', 'ticket-3');

DELETE FROM pricing
WHERE id IN ('price-1', 'price-2', 'price-3');

DELETE FROM activity
WHERE message IN (
  'Proposal shared with EduSpark Institute',
  'Payment reminder added for Restaurant website',
  'Design review completed for Dashboard UI',
  'Backend database initialized',
  'Admin system connected to local API',
  'Admin function connected',
  'Ready for cloud persistence'
);
