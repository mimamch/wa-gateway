import type { FC } from "hono/jsx";
import RootLayout from "../layout";

const AuthIndex: FC<{ error?: string }> = ({ error }) => {
  return (
    <RootLayout>
      <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            🔑 Sign in with your key
          </h2>
        </div>

        <div class="mt-2 sm:mx-auto sm:w-full sm:max-w-sm">
          <form class="space-y-2" action="" method="post">
            <div>
              <div class="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  placeholder="Key"
                  class="px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            {error && (
              <p class="mt-2 text-sm text-red-600" id="login-error">
                {error}
              </p>
            )}
            <div>
              <button
                type="submit"
                class="flex w-full justify-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </RootLayout>
  );
};

export default AuthIndex;
