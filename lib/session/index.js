// dsh-session-info host half: contributes nothing host-side.
// The empty apply exists so the row appears in the host Loader;
// all behavior ships through exports["./client"].
function apply() {}
export { apply };
