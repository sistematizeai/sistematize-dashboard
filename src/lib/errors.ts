type ApiErrorLike = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null) {
    const err = error as ApiErrorLike;
    return err.response?.data?.message || err.message || fallback;
  }

  return fallback;
}
