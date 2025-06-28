import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import {
  DocumentTextIcon,
  BellIcon,
  HomeIcon,
  UsersIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type NavItem = {
  name: string;
  href?: string;
  icon: React.ElementType;
  children?: { name: string; href: string }[];
};

const getNavigation = (role?: string): NavItem[] => {
  const nav: NavItem[] = [
    { name: 'Beranda', href: '/dashboard', icon: HomeIcon },
    { name: 'Warga', href: '/warga', icon: UsersIcon },
  ];

  if (role === 'admin') {
    // Tambahkan "Pengguna" setelah Beranda
    nav.splice(1, 0, { name: 'Pengguna', href: '/users', icon: UsersIcon });

    // Tambahkan "Laporan" setelah Statistik
    nav.splice(3, 0, {
      name: 'Laporan',
      icon: DocumentTextIcon,
      children: [
        { name: 'Laporan Masuk', href: '/laporan?status=pending' },
        { name: 'Laporan Diproses', href: '/laporan?status=diproses' },
        { name: 'Laporan Selesai', href: '/laporan?status=selesai' },
        { name: 'Laporan Ditolak', href: '/laporan?status=ditolak' },
      ],
    });

    // Tambahkan "Pantau Kas" setelah Laporan
    nav.splice(4, 0, {
      name: 'Pantau Kas',
      href: '/pantau-kas',
      icon: CurrencyDollarIcon,
    });
  } else if (role === 'rt' || role === 'rw') {
    // Laporan single link
    nav.splice(2, 0, {
      name: 'Laporan',
      href: '/laporan',
      icon: DocumentTextIcon,
    });

    // Tambahkan "Lapor Kas" setelah Laporan
    const kasChildren = [{ name: 'Rekap Kas', href: '/rekap-kas' }];
    if (role === 'rt') {
      kasChildren.push({ name: 'Upload Laporan', href: '/upload-kas' });
    }

    nav.splice(3, 0, {
      name: 'Lapor Kas',
      icon: CurrencyDollarIcon,
      children: kasChildren,
    });
  }

  return nav;
};



export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDropdownName, setOpenDropdownName] = useState<string | null>(null);
  const navigation = getNavigation(user?.role);

  const isDropdownActive = (children: { href: string }[]) => {
    return children.some(child => location.pathname + location.search === child.href);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between bg-[#0B39AA] p-4 text-white">
        <button onClick={() => setSidebarOpen(true)}>
          <Bars3Icon className="w-6 h-6" />
        </button>
        <div className="flex items-center justify-center  space-x-2 px-4">
          <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
          <span className="font-bold text-xl">Cepat Tanggap</span>
        </div>
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
            <div className="relative z-50 w-64 bg-[#0B39AA] text-white p-4">
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
                            setOpenDropdownName(openDropdownName === item.name ? null : item.name)
                          }
                          className={classNames(
                            isDropdownActive(item.children)
                              ? 'bg-[#082F8C] text-white'
                              : 'text-white/80 hover:bg-[#2F54B6] hover:text-white',
                            'flex justify-between w-full items-center px-2 py-2 rounded-md text-sm font-medium transition'
                          )}
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
                              className={classNames(
                                location.pathname + location.search === sub.href
                                  ? 'bg-[#082F8C] text-white'
                                  : 'text-white/80 hover:bg-[#2F54B6] hover:text-white',
                                'block px-2 py-1 rounded-md text-sm transition'
                              )}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </>
                    ) : item.href && (
                      <Link
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={classNames(
                          location.pathname === item.href
                            ? 'bg-[#082F8C] text-white'
                            : 'text-white/80 hover:bg-[#2F54B6] hover:text-white',
                          'flex items-center px-2 py-2 rounded-md text-sm transition'
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
      <div className="hidden lg:flex lg:w-64 lg:flex-col fixed top-0 bottom-0 z-50 bg-[#0B39AA] text-white">
        <div className="flex items-center justify-center h-16 space-x-2 px-4">
          <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
          <span className="font-bold text-xl">Cepat Tanggap</span>
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
                    className={classNames(
                      isDropdownActive(item.children)
                        ? 'bg-[#082F8C] text-white'
                        : 'text-white/80 hover:bg-[#2F54B6] hover:text-white',
                      'w-full flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md transition'
                    )}
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
                            ? 'bg-[#082F8C] text-white'
                            : 'text-white/80 hover:bg-[#2F54B6] hover:text-white',
                          'block px-2 py-1 text-sm rounded-md transition'
                        )}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </>
              ) : item.href && (
                <Link
                  to={item.href}
                  className={classNames(
                    location.pathname === item.href
                      ? 'bg-[#082F8C] text-white'
                      : 'text-white/80 hover:bg-[#2F54B6] hover:text-white',
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

      {/* Header Desktop */}
      <div className="hidden lg:flex sticky top-0 z-40 h-16 bg-white shadow justify-end px-4 items-center">
        <button className="p-1 text-gray-500 hover:text-gray-700">
          <BellIcon className="h-6 w-6" />
        </button>
        <Menu as="div" className="ml-3 relative">
          <Menu.Button className="flex items-center space-x-3 text-sm bg-white rounded-full focus:outline-none">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-700">{user?.name}</div>
              <div className="text-xs text-gray-500 capitalize">
                {user?.role}{' '}
                {(user?.role === 'rt' || user?.role === 'rw') &&
                  `(RT ${user?.rt || '-'} / RW ${user?.rw || '-'})`}
              </div>
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

      {/* Main Content */}
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
