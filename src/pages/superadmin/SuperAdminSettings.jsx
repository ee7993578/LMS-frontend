import SettingsPage from "../SettingsPage";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import { Input, Label } from "../../components/ui/Input";
import Button from "../../components/ui/Button";

function SystemConfigSection() {
  return (
    <Card className="mt-5">
      <CardHeader><CardTitle>System configuration</CardTitle></CardHeader>
      <CardBody className="grid sm:grid-cols-2 gap-4 max-w-xl">
        <div>
          <Label>Default grace period (days)</Label>
          <Input type="number" defaultValue={7} />
        </div>
        <div>
          <Label>Platform support email</Label>
          <Input defaultValue="support@studyhub.app" />
        </div>
        <div className="sm:col-span-2">
          <Button variant="secondary">Save configuration</Button>
        </div>
      </CardBody>
    </Card>
  );
}

export default function SuperAdminSettings() {
  return <SettingsPage extraSections={<SystemConfigSection />} />;
}
