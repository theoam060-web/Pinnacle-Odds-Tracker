export function useUpgradePortal() {
  function openPortal() {
    window.location.href = "/pricing";
  }

  return { openPortal, loading: false };
}
