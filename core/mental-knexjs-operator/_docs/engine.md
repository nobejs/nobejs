A Mental Engine Implementation needn't cover all the spec, so, we have come up with some convention:

The convention is applied in following categories:

--

A complete implementation of Mental Spec covers following:

- Covers all the get, create, update, patch, delete operations in single and bulk
- All types of fields are covered
- Can keep track of audit log
- Implements validation
- Stores all events
- Implements auto caching
- Implements lenses (borrowed work from Laravel Nova)
- Implements authorization at field level

Implementations might not implement entire spec.

Mental Spec Version
