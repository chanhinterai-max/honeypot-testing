export function ErrorComponent({ error }: { error: Error }) {
  return (
    <div className="p-8 text-center">
      <h1 className="text-xl text-down">Something went wrong</h1>
      <p className="mt-2 text-sm">{error.message}</p>
    </div>
  );
}
