const EmptyState = ({ icon: Icon, message, iconClassName = 'text-ink-200', padded = true, children }) => (
  <div className={padded ? 'p-10 text-center' : 'py-10 text-center'}>
    <Icon size={28} className={`${iconClassName} mb-3 mx-auto`} />
    <p className="text-sm text-ink-600">{message}</p>
    {children}
  </div>
);

export default EmptyState;
