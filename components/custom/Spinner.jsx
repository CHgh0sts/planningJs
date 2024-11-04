export const Spinner = () => {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <div className="spinner-border inline-block w-8 h-8 border-4 rounded-full" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  };
  