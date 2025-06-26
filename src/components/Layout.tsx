import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import {
  ChartBarIcon,
  DocumentTextIcon,
  BellIcon,
  HomeIcon,
  UsersIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const getNavigation = (role?: string) => {
  const nav = [
    { name: 'Beranda', href: '/dashboard', icon: HomeIcon },
    { name: 'Warga', href: '/warga', icon: UsersIcon },
    {
      name: 'Laporan',
      icon: DocumentTextIcon,
      children: [
    { name: 'Laporan Masuk', href: '/laporan?status=pending' },
    { name: 'Laporan Diproses', href: '/laporan?status=diproses' },
    { name: 'Laporan Selesai', href: '/laporan?status=selesai' },
    { name: 'Laporan Ditolak', href: '/laporan?status=ditolak' },
      ],
    },
    { name: 'Statistik', href: '#', icon: ChartBarIcon },
    { name: 'Pengaturan', href: '#', icon: CogIcon },
  ];

  if (role === 'admin') {
    nav.splice(1, 0, { name: 'Pengguna', href: '/users', icon: UsersIcon });
  }

  return nav;
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDropdownName, setOpenDropdownName] = useState<string | null>(null);
  const navigation = getNavigation(user?.role);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-blue-600 p-4 text-white">
        <button onClick={() => setSidebarOpen(true)}>
          <Bars3Icon className="w-6 h-6" />
        </button>
        <span className="text-lg font-bold">Cepat Tanggap</span>
        <div className="h-6 w-6" />
      </div>

      {/* Sidebar Mobile */}
      <Transition show={sidebarOpen} as={Fragment}>
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)} />
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-300"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-300"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative z-50 w-64 bg-blue-700 text-white p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Cepat Tanggap</h2>
                <button onClick={() => setSidebarOpen(false)}>
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.children ? (
                      <>
                        <button
                          onClick={() =>
                            setOpenDropdownName(
                              openDropdownName === item.name ? null : item.name
                            )
                          }
                          className="flex justify-between w-full items-center px-2 py-2 rounded-md hover:bg-blue-600"
                        >
                          <div className="flex items-center">
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                          </div>
                          <ChevronDownIcon
                            className={classNames(
                              'w-4 h-4 transition-transform',
                              openDropdownName === item.name ? 'rotate-180' : ''
                            )}
                          />
                        </button>
                        <div
                          className={classNames(
                            'ml-8 space-y-1 transition-all overflow-hidden',
                            openDropdownName === item.name ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                          )}
                        >
                          {item.children.map((sub) => (
                            <Link
                              key={sub.name}
                              to={sub.href}
                              onClick={() => setSidebarOpen(false)}
                              className="block px-2 py-1 rounded-md text-sm hover:bg-blue-600 text-blue-100"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </>
                    ) : (
                      <Link
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={classNames(
                          location.pathname === item.href
                            ? 'bg-blue-800 text-white'
                            : 'text-blue-100 hover:bg-blue-600',
                          'flex items-center px-2 py-2 rounded-md text-sm'
                        )}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </Transition.Child>
        </div>
      </Transition>

      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col fixed top-0 bottom-0 z-50 bg-blue-700 text-white">

        <div className="flex items-center justify-center h-16 font-bold text-xl">
          Cepat Tanggap
        </div>
        <nav className="mt-5 px-2 space-y-1">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <>
                  <button
                    onClick={() =>
                      setOpenDropdownName(openDropdownName === item.name ? null : item.name)
                    }
                    className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md hover:bg-blue-600"
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-4 h-6 w-6" />
                      {item.name}
                    </div>
                    <ChevronDownIcon
                      className={classNames(
                        'h-4 w-4 transition-transform duration-300',
                        openDropdownName === item.name ? 'rotate-180' : ''
                      )}
                    />
                  </button>
                  <div
                    className={classNames(
                      'ml-8 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out',
                      openDropdownName === item.name ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    )}
                  >
                    {item.children.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.href}
                        className={classNames(
                          location.pathname + location.search === sub.href
                            ? 'bg-blue-800 text-white'
                            : 'text-blue-100 hover:bg-blue-600 hover:text-white',
                          'block px-2 py-1 text-sm rounded-md transition'
                        )}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  to={item.href}
                  className={classNames(
                    location.pathname === item.href
                      ? 'bg-blue-800 text-white'
                      : 'text-blue-100 hover:bg-blue-600 hover:text-white',
                    'flex items-center px-2 py-2 text-sm rounded-md transition'
                  )}
                >
                  <item.icon className="mr-4 h-6 w-6" />
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Header desktop */}
      <div className="hidden lg:flex sticky top-0 z-40 h-16 bg-white shadow justify-end px-4 items-center">
        <button className="p-1 text-gray-500 hover:text-gray-700">
          <BellIcon className="h-6 w-6" />
        </button>
        <Menu as="div" className="ml-3 relative">
          <Menu.Button className="flex items-center text-sm bg-white rounded-full focus:outline-none">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/profile"
                    className={classNames(
                      active ? 'bg-gray-100' : '',
                      'block px-4 py-2 text-sm text-gray-700'
                    )}
                  >
                    Profil Saya
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={logout}
                    className={classNames(
                      active ? 'bg-gray-100' : '',
                      'block w-full text-left px-4 py-2 text-sm text-gray-700'
                    )}
                  >
                    Keluar
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};
