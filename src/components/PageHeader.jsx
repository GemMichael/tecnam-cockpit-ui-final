function PageHeader({
  title,
  subtitle,
  rightContent,
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
          TECNAM P2002JF TRAINER
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
            {subtitle}
          </p>
        )}
      </div>

      {rightContent && (
        <div className="shrink-0">
          {rightContent}
        </div>
      )}
    </div>
  );
}

export default PageHeader;