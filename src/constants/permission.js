const ACL_USER_CREATE = 'CREATE USER';
const ACL_USER_DELETE = 'DELETE USER';
const ACL_ROLE_CREATE = 'ALLOCATE ROLES';
const ACL_ROLE_UPDATE = 'UPDATE ROLE';

const PERMISSIONS = [
  {
    id: 1,
    name: ACL_USER_CREATE,
  },
  {
    id: 2,
    name: ACL_USER_DELETE,
  },
  {
    id: 3,
    name: ACL_ROLE_CREATE,
  },
  {
    id: 4,
    name: ACL_ROLE_UPDATE,
  },
];

module.exports = {
  PERMISSIONS,
};
